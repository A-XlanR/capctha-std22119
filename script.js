document
  .getElementById("captchaForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const N = parseInt(document.getElementById("numberInput").value, 10);
    const logDiv = document.getElementById("log");
    logDiv.textContent = "";

    for (let i = 1; i <= N; i++) {
      try {
        const response = await fetchWithCaptcha(
          `https://api.prod.jcloudify.com/whoami`,
          i
        );
        logDiv.textContent += `${i}. ${
          response.status === 200 ? "OK" : "Forbidden"
        }\n`;
      } catch (error) {
        logDiv.textContent += `${i}. Une erreur est survenue : ${error.message}\n`;
        break;
      }
    }
  });

async function fetchWithCaptcha(url, i) {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const response = await fetch(url);

        if (response.status === 403) {
          window._AWSWAF.showCaptchaChallenge();
          window._AWSWAF.onCaptchaSolved(() => {
            resolve(fetchWithCaptcha(url, i));
          });
        } else {
          resolve(response);
        }
      } catch (error) {
        reject(error);
      }
    }, i * 1000);
  });
}
