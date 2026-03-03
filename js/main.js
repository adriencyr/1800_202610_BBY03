import 'bootstrap/dist/css/bootstrap.min.css';

import 'bootstrap';

// If you have custom global styles, import them as well:
import '../css/style.css';

function sayHello() {

}
// document.addEventListener('DOMContentLoaded', sayHello);


document.addEventListener('DOMContentLoaded', () => {
  fetch('/components/navbar.html')
    .then(response => response.text())
    .then(data => {
      const navbar = document.getElementById('navbar');
      if (navbar) {
        navbar.innerHTML = data;
      } else {
        console.error('Navbar element not found!');
      }
    })
    .catch(err => console.error('Failed to load navbar:', err));

  const message = localStorage.getItem("loginAttempt");
  if (message) {
    console.log(message);
    localStorage.removeItem("loginAttempt");
  }
});

document.addEventListener("DOMContentLoaded", () => {

    const message = localStorage.getItem("loginAttempt");

    if (message) {
        console.log(message);

        // Remove so it doesn't show again
        localStorage.removeItem("loginAttempt");
    }

});
