/* ======================================================
   STUDENT GOOGLE REGISTRATION
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
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";


const googleSignupButton =
  document.getElementById(
    "google-student-signup"
  );

const googleSignupMessage =
  document.getElementById(
    "signup-google-message"
  );


function showGoogleSignupMessage(
  text,
  isError
) {
  if (!googleSignupMessage) {
    return;
  }

  googleSignupMessage.textContent =
    text;

  googleSignupMessage.style.color =
    isError
      ? "#ef9a9a"
      : "var(--yellow)";
}


async function registerStudentWithGoogle() {
  if (!googleSignupButton) {
    return;
  }

  googleSignupButton.disabled =
    true;

  googleSignupButton.textContent =
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


    const user =
      result.user;


    const profileReference =
      doc(
        db,
        "users",
        user.uid
      );


    const profileSnapshot =
      await getDoc(
        profileReference
      );


    /*
      Existing approved student:
      send them directly to the dashboard.
    */
    if (
      profileSnapshot.exists()
    ) {
      const profile =
        profileSnapshot.data();


      if (
        profile.role === "student" &&
        profile.status === "active"
      ) {
        window.location.href =
          "./student.html";

        return;
      }


      if (
        profile.role === "student" &&
        profile.status === "pending"
      ) {
        await signOut(auth);

        showGoogleSignupMessage(
          "Your account is waiting for administrator approval.",
          false
        );

        return;
      }


      await signOut(auth);

      showGoogleSignupMessage(
        "This Google account cannot be registered as a student.",
        true
      );

      return;
    }


    /*
      New Google student:
      create a pending Firestore profile.
    */
    await setDoc(
      profileReference,
      {
        name:
          user.displayName ||
          "Student",

        email:
          user.email ||
          "",

        photoUrl:
          user.photoURL ||
          "",

        role:
          "student",

        status:
          "pending",

        authProvider:
          "google",

        createdAt:
          serverTimestamp()
      }
    );


    await signOut(auth);


    showGoogleSignupMessage(
      "Registration completed. Your account will be available after administrator approval.",
      false
    );


  } catch (error) {
    console.error(
      "Google student registration failed:",
      error
    );


    showGoogleSignupMessage(
      "Google registration could not be completed. Please try again.",
      true
    );


  } finally {
    googleSignupButton.disabled =
      false;

    googleSignupButton.textContent =
      "Continue with Google";
  }
}


if (
  googleSignupButton
) {
  googleSignupButton.addEventListener(
    "click",
    registerStudentWithGoogle
  );
}