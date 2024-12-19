document
  .getElementById("captchaForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const N = parseInt(document.getElementById("numberInput").value, 10);
    const logDiv = document.getElementById("log");
    logDiv.textContent = "";

    for (let i = 1; i <= N; i++) {
      try {
        // Delay before each request
        await delay(1000); 

        const response = await performRequest(
          `https://api.prod.jcloudify.com/whoami`,
          i
        );
        logDiv.textContent += `${i}. ${
          response.status === 200 ? "OK" : "Forbidden"
        }\n`;
      } catch (error) {
        logDiv.textContent += `${i}. Une erreur est survenue : ${error.message}\n`;
        console.error("Request error:", error); // Log the error to the console for debugging
        break; // Exit the loop if there's an error
      }
    }
  });

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function performRequest(url, i) {
  try {
    const response = await fetch(url);
    if (response.status === 403) {
      // Captcha challenge needs to be handled
      return handleCaptchaChallenge(url, i);
    }
    return response;
  } catch (error) {
    throw error; // Re-throw the error to be handled by the calling function
  }
}

async function handleCaptchaChallenge(url, i) {
  return new Promise((resolve, reject) => {
    if (
      typeof window._AWSWAF === "undefined" ||
      typeof window._AWSWAF.showCaptchaChallenge !== "function" ||
      typeof window._AWSWAF.onCaptchaSolved !== "function"
    ) {
      console.error(
        "AWS WAF Captcha SDK not properly loaded. Check your script tag."
      );
      reject(new Error("AWS WAF Captcha SDK not loaded")); // Reject the promise if the SDK is not available
      return;
    }

    window._AWSWAF.showCaptchaChallenge();
    window._AWSWAF.onCaptchaSolved(async (token) => {
      try {
        const responseWithToken = await fetch(url, {
          headers: {
            "x-captcha-passed": token,
          },
        });
        if (responseWithToken.ok) {
          resolve(responseWithToken);
        } else {
          console.error(
            "Request with token failed:",
            responseWithToken.status,
            responseWithToken.statusText
          );
          // Retry without token to trigger a new captcha if necessary.
          resolve(performRequest(url, i));
        }
      } catch (error) {
        reject(error);
      }
    });
    window._AWSWAF.onCaptchaExpired(() => {
      console.log("Captcha expired");
      resolve(performRequest(url, i));
    });
    window._AWSWAF.onCaptchaFailed(() => {
      console.log("Captcha failed");
      resolve(performRequest(url, i));
    });
  });
}
