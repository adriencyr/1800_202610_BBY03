import 'bootstrap/dist/css/bootstrap.min.css';

import 'bootstrap';

// If you have custom global styles, import them as well:
import '../css/style.css';

function sayHello() {

}
// document.addEventListener('DOMContentLoaded', sayHello);

fetch('/components/navbar.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('navbar').innerHTML = data;
  });
