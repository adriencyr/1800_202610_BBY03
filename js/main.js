import 'bootstrap/dist/css/bootstrap.min.css';

import 'bootstrap';

// If you have custom global styles, import them as well:
import '../css/style.css';

function sayHello() {

}
// document.addEventListener('DOMContentLoaded', sayHello);


function loadNavbar() {
  // Use relative path for all pages
  fetch('components/navbar.html')
    .then(response => response.text())
    .then(data => {
      const navbarDiv = document.getElementById('navbar');
      if (navbarDiv) navbarDiv.innerHTML = data;
    })
    .catch(err => {
      console.error('Failed to load navbar:', err);
    });
}
document.addEventListener('DOMContentLoaded', loadNavbar);

document.addEventListener("DOMContentLoaded", () => {

    const message = localStorage.getItem("loginAttempt");

    if (message) {
        console.log(message);

        // Remove so it doesn't show again
        localStorage.removeItem("loginAttempt");
    }

});
