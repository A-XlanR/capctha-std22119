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
        });
    }
    makeRequest();
  });
