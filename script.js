document.getElementById("numberForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const N = parseInt(document.getElementById("number").value);
  const outputDiv = document.getElementById("output");
  let counter = 0;

  function makeRequest() {
    fetch('https://api.prod.jcloudify.com/whoami')
      .then(response => {
        if (response.status === 403) {
          counter++;
          outputDiv.innerHTML += `${counter}. Forbidden<br>`;
          if (counter < N) {
            setTimeout(makeRequest, 1000); // Wait 1 second before the next request
          }
        } else {
          console.log("Request successful or returned another status:", response.status);
        }
      })
      .catch(error => {
        console.error('Error:', error);

        // Handle CAPTCHA-specific scenarios
        if (error.message.includes('CAPTCHA') || error.response?.status === 429) {
          loadCaptcha();
        }
      });
  }

  function loadCaptcha() {
    // Ensure the CAPTCHA container is ready
    const captchaContainer = document.getElementById('captcha-container');
    captchaContainer.innerHTML = ''; // Clear any previous CAPTCHA

    // Load the CAPTCHA script
    const captchaScript = document.createElement('script');
    captchaScript.src = "https://b82b1763d1c3.eu-west-3.captcha-sdk.awswaf.com/b82b1763d1c3/jsapi.js";
    captchaScript.defer = true;
    document.body.appendChild(captchaScript);

    captchaScript.onload = () => {
      console.log('CAPTCHA script loaded.');

      // Initialize CAPTCHA
      if (window.CaptchaSDK) {
        window.CaptchaSDK.render('captcha-container', {
          siteKey: 'your-site-key', // Replace with your actual site key
          callback: (captchaResponse) => {
            console.log('CAPTCHA solved:', captchaResponse);
            // Optionally, resume requests after CAPTCHA is solved
            makeRequest();
          },
        });
      } else {
        console.error('CAPTCHA SDK is not available.');
      }
    };
  }

  makeRequest();
});
