import 'bootstrap/dist/css/bootstrap.min.css';

import 'bootstrap';

// If you have custom global styles, import them as well:
import '../css/style.css';

function sayHello() {

}
// document.addEventListener('DOMContentLoaded', sayHello);

// Inject shared navbar
fetch('/components/navbar.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('navbar').innerHTML = data;
  });

// Inject shared footer
fetch('/components/footer.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('footer').innerHTML = data;
  });

document.addEventListener("DOMContentLoaded", () => {

    const message = localStorage.getItem("loginAttempt");

    if (message) {
        console.log(message);

        // Remove so it doesn't show again
        localStorage.removeItem("loginAttempt");
    }

});
