const loginForm = document.getElementById("login-form");
const message = document.getElementById("login-message");

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document
    .getElementById("login-email")
    .value
    .trim()
    .toLowerCase();

  const password = document
    .getElementById("login-password")
    .value
    .trim();

  /*
    TEMPORARY LOCAL TEST ACCOUNTS ONLY.

    These will be removed after Firebase Authentication
    is connected.
  */

  if (
    email === "admin@ionyverse.local" &&
    password === "Admin123!"
  ) {
    sessionStorage.setItem("lmsRole", "admin");
    window.location.href = "./admin.html";
    return;
  }

  if (
    email === "student@ionyverse.local" &&
    password === "Student123!"
  ) {
    sessionStorage.setItem("lmsRole", "student");
    window.location.href = "./student.html";
    return;
  }

  message.textContent = "Incorrect email or password.";
});