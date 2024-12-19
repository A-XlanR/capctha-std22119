const form = document.getElementById('generatorForm');
const result = document.getElementById('result');

form.addEventListener('submit', function(event) {
    event.preventDefault();
    result.innerHTML = ""; // Clear previous results
    const n = parseInt(document.getElementById('number').value);

    let counter = 1;

    function generateLine() {
        fetch('https://api.prod.jcloudify.com/whoami')
            .then(response => {
                if (!response.ok && response.status === 403 && typeof AWSCaptcha !== 'undefined') {
                    // Handle CAPTCHA
                    AWSCaptcha.load('result', function() {
                        AWSCaptcha.execute(function(token) {
                            // Send the token with the next request (example with a header)
                            fetch('https://api.prod.jcloudify.com/whoami', {
                                headers: {
                                    'X-Captcha-Token': token
                                }
                            }).then(response => {
                                if (response.ok) {
                                    result.innerHTML += `${counter}. Forbidden<br>`;
                                    counter++;
                                    if (counter <= n) {
                                        setTimeout(generateLine, 1000);
                                    }
                                } else {
                                    console.error("Error after CAPTCHA resolution", response);
                                    result.innerHTML += `Error after CAPTCHA ${response.status}<br>`;
                                }
                            });
                        });
                    });
                    return; // Important: exit the function to not continue without CAPTCHA
                } else if (response.ok) {
                    result.innerHTML += `${counter}. Forbidden<br>`;
                    counter++;
                    if (counter <= n) {
                        setTimeout(generateLine, 1000);
                    }
                } else {
                    result.innerHTML += `Error ${response.status}<br>`;
                    counter++;
                    if (counter <= n) {
                        setTimeout(generateLine, 1000);
                    }
                }
            })
            .catch(error => {
                console.error("Request error:", error);
                result.innerHTML += `Request error<br>`;
                counter++;
                if (counter <= n) {
                    setTimeout(generateLine, 1000);
                }
            });
    }

    if (n >= 1 && n <= 1000) {
        generateLine();
    } else {
        result.innerHTML = "Please enter a number between 1 and 1000.";
    }
});
