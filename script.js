const form = document.getElementById("captchaForm");
const logDiv = document.getElementById("log");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const numberInput = document.getElementById("numberInput");
  const N = parseInt(numberInput.value, 10);

  if (isNaN(N) || N < 1 || N > 1000) {
    logDiv.textContent = "Veuillez entrer un nombre valide entre 1 et 1000.";
    return;
  }

  // Cache le formulaire et affiche la séquence
  form.style.display = "none";
  logDiv.textContent = "";

  for (let i = 1; i <= N; i++) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await fetch("https://api.prod.jcloudify.com/whoami", {
        method: "GET",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        logDiv.textContent += `${i}. Forbidden\n`;
      } else if (response.status === 403) {
        logDiv.textContent += `${i}. CAPTCHA nécessaire, en attente...\n`;
        await handleCaptcha();

        logDiv.textContent += `${i}. CAPTCHA résolu\n`;
      } else {
        logDiv.textContent += `${i}. Erreur: ${response.statusText}\n`;
      }
    } catch (error) {
      logDiv.textContent += `${i}. Erreur: ${error.message}\n`;
    }
  }
});

async function handleCaptcha() {
  return new Promise((resolve) => {
    window.__AWSCAPTCHA__.run({
      callback: () => {
        resolve();
      },
      onError: (err) => {
        logDiv.textContent += `Erreur CAPTCHA: ${err.message}\n`;
        resolve();
      },
    });
  });
}
