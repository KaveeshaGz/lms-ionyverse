/* ======================================================
   SHARED FIREBASE LOGIN
====================================================== */

import {
  auth,
  db
} from "./firebase-config.js";

import {
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";


const loginForm = document.getElementById("login-form");
const message = document.getElementById("login-message");

const submitButton = loginForm.querySelector(
  'button[type="submit"]'
);


loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document
    .getElementById("login-email")
    .value
    .trim()
    .toLowerCase();

  const password = document
    .getElementById("login-password")
    .value;

  if (!email || !password) {
    showLoginMessage(
      "Please enter your email and password.",
      "error"
    );

    return;
  }

  setLoadingState(true);

  showLoginMessage(
    "Checking your account...",
    "info"
  );

  try {
    const credential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    const user = credential.user;

    const userReference = doc(
      db,
      "users",
      user.uid
    );

    const userSnapshot =
      await getDoc(userReference);

    if (!userSnapshot.exists()) {
      await signOut(auth);

      showLoginMessage(
        "Your LMS profile was not found. Please contact the administrator.",
        "error"
      );

      setLoadingState(false);

      return;
    }

    const profile = userSnapshot.data();

    if (profile.status !== "active") {
      await signOut(auth);

      showLoginMessage(
        "Your account is not active. Please contact the administrator.",
        "error"
      );

      setLoadingState(false);

      return;
    }

    sessionStorage.setItem(
      "lmsRole",
      profile.role
    );

    sessionStorage.setItem(
      "lmsUserUid",
      user.uid
    );

    sessionStorage.setItem(
      "lmsUserEmail",
      user.email || ""
    );

    sessionStorage.setItem(
      "lmsUserName",
      profile.name || ""
    );

    if (profile.role === "admin") {
      window.location.href = "./admin.html";
      return;
    }

    if (profile.role === "student") {
      window.location.href = "./student.html";
      return;
    }

    await signOut(auth);

    sessionStorage.clear();

    showLoginMessage(
      "Your account role is not valid. Please contact the administrator.",
      "error"
    );

    setLoadingState(false);

  } catch (error) {
    console.error("Firebase login error:", error);

    showLoginMessage(
      getFriendlyLoginError(error.code),
      "error"
    );

    setLoadingState(false);
  }
});


function setLoadingState(isLoading) {
  submitButton.disabled = isLoading;

  submitButton.textContent =
    isLoading
      ? "Signing In..."
      : "Sign In";
}


function showLoginMessage(text, type) {
  message.textContent = text;

  message.style.color =
    type === "error"
      ? "#EF9A9A"
      : "#FFD400";
}


function getFriendlyLoginError(errorCode) {
  const messages = {
    "auth/invalid-credential":
      "Incorrect email or password.",

    "auth/invalid-email":
      "Please enter a valid email address.",

    "auth/user-disabled":
      "This login account has been disabled.",

    "auth/too-many-requests":
      "Too many login attempts. Please wait and try again.",

    "auth/network-request-failed":
      "Network error. Check your internet connection."
  };

  return (
    messages[errorCode] ||
    "Login failed. Please try again."
  );
}
