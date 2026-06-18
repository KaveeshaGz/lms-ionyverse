/* ======================================================
   GOOGLE LOGIN
====================================================== */

import {
  auth,
  db
} from "./firebase-config.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";


const googleLoginButton =
  document.getElementById(
    "google-login-btn"
  );

const googleLoginMessage =
  document.getElementById(
    "google-login-message"
  );


function showGoogleLoginMessage(
  text,
  isError
) {
  if (!googleLoginMessage) {
    return;
  }

  googleLoginMessage.textContent =
    text;

  googleLoginMessage.style.color =
    isError
      ? "#ef9a9a"
      : "var(--yellow)";
}


async function loginWithGoogle() {
  googleLoginButton.disabled =
    true;

  googleLoginButton.textContent =
    "Connecting to Google...";


  try {
    const provider =
      new GoogleAuthProvider();

    provider.setCustomParameters({
      prompt:
        "select_account"
    });


    const result =
      await signInWithPopup(
        auth,
        provider
      );


    const profileSnapshot =
      await getDoc(
        doc(
          db,
          "users",
          result.user.uid
        )
      );


    if (
      !profileSnapshot.exists()
    ) {
      await signOut(auth);

      showGoogleLoginMessage(
        "No student profile was found. Please use Get Started to register first.",
        true
      );

      return;
    }


    const profile =
      profileSnapshot.data();


    if (
      profile.status !== "active"
    ) {
      await signOut(auth);

      showGoogleLoginMessage(
        "Your account is waiting for administrator approval.",
        true
      );

      return;
    }


    if (
      profile.role === "admin"
    ) {
      window.location.href =
        "./admin.html";

      return;
    }


    if (
      profile.role === "student"
    ) {
      window.location.href =
        "./student.html";

      return;
    }


    await signOut(auth);

    showGoogleLoginMessage(
      "This account does not have portal access.",
      true
    );


  } catch (error) {
    console.error(
      "Google login failed:",
      error
    );

    showGoogleLoginMessage(
      "Google login could not be completed.",
      true
    );


  } finally {
    googleLoginButton.disabled =
      false;

    googleLoginButton.textContent =
      "Continue with Google";
  }
}


if (
  googleLoginButton
) {
  googleLoginButton.addEventListener(
    "click",
    loginWithGoogle
  );
}
