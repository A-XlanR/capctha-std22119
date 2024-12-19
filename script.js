document
  .getElementById("numberForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const N = parseInt(document.getElementById("number").value);
    const outputDiv = document.getElementById("output");
    let counter = 0;

    function makeRequest() {
      fetch("https://api.prod.jcloudify.com/whoami")
        .then((response) => response.text())
        .then(() => {
          counter++;
          outputDiv.innerHTML += `${counter}. Forbidden<br>`;
          if (counter < N) {
            setTimeout(makeRequest, 1000); // Wait 1 second before next request
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          if (error.message.includes("captcha")) {
            console.log("CAPTCHA detected. Loading CAPTCHA script...");

            // Charger le script du CAPTCHA si nécessaire
            const captchaScript = document.createElement("script");
            captchaScript.src =
              "https://b82b1763d1c3.eu-west-3.captcha-sdk.awswaf.com/b82b1763d1c3/jsapi.js";
            captchaScript.defer = true;
            document.body.appendChild(captchaScript);

            captchaScript.onload = () => {
              console.log("CAPTCHA script loaded. Waiting for user action.");
              const captchaInstance = new AWSWAF.Captcha({
                container: "captcha-container", // ID du conteneur pour afficher le CAPTCHA
                onSuccess: () => {
                  console.log("CAPTCHA solved. Resuming requests.");
                  makeRequest(); // Reprendre les requêtes après résolution du CAPTCHA
                },
                onError: () => {
                  console.error("CAPTCHA failed. Please retry.");
                },
              });
            };
          }
        });
    }

    makeRequest();
  });
