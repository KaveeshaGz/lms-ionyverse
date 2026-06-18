/* ======================================================
   STUDENT FIREBASE SIGN UP
====================================================== */

import {
  auth,
  db
} from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
  deleteUser
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";


const signupForm =
  document.getElementById("signup-form");

const message =
  document.getElementById("signup-message");

const submitButton =
  document.getElementById("signup-submit-button");


signupForm.addEventListener(
  "submit",
  async function (event) {
    event.preventDefault();

    const name = document
      .getElementById("signup-name")
      .value
      .trim();

    const email = document
      .getElementById("signup-email")
      .value
      .trim()
      .toLowerCase();

    const password = document
      .getElementById("signup-password")
      .value;

    const confirmPassword = document
      .getElementById("signup-confirm-password")
      .value;


    if (!name || !email || !password || !confirmPassword) {
      showSignupMessage(
        "Please complete every field.",
        "error"
      );

      return;
    }


    if (
        typeof window.isStrongPassword !== "function" ||
        !window.isStrongPassword(password)
        ) {
    showSignupMessage(
        "Use at least 8 characters with an uppercase letter, lowercase letter, number, and symbol.",
        "error"
    );

    return;
    }


    if (password !== confirmPassword) {
      showSignupMessage(
        "The passwords do not match.",
        "error"
      );

      return;
    }


    setLoadingState(true);

    showSignupMessage(
      "Creating your student account...",
      "info"
    );


    let createdUser = null;

    try {
      /*
        1. Create Firebase Authentication account.
      */
      const credential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      createdUser = credential.user;


      /*
        2. Save display name in Firebase Authentication.
      */
      await updateProfile(createdUser, {
        displayName: name
      });


      /*
        3. Create matching Firestore profile.
        Student cannot choose role or approval status.
      */
      await setDoc(
        doc(
          db,
          "users",
          createdUser.uid
        ),
        {
          name: name,
          email: email,
          role: "student",
          status: "pending",
          createdAt: serverTimestamp()
        }
      );


      /*
        4. Send verification email.
      */
      try {
        await sendEmailVerification(createdUser);
      } catch (verificationError) {
        console.warn(
          "Verification email could not be sent:",
          verificationError
        );
      }


      /*
        5. Account remains pending until admin approval.
      */
      await signOut(auth);

      sessionStorage.clear();

      signupForm.reset();

      showSignupMessage(
        "Registration submitted successfully. Check your email and wait for administrator approval.",
        "success"
      );

    } catch (error) {
      console.error(
        "Student sign-up error:",
        error
      );


      /*
        Remove incomplete Authentication account
        if profile creation failed.
      */
      if (
        createdUser &&
        error.code !== "auth/email-already-in-use"
      ) {
        try {
          await deleteUser(createdUser);
        } catch (deleteError) {
          console.warn(
            "Incomplete account could not be removed:",
            deleteError
          );
        }
      }


      showSignupMessage(
        getFriendlySignupError(error.code),
        "error"
      );

    } finally {
      setLoadingState(false);
    }
  }
);


function setLoadingState(isLoading) {
  submitButton.disabled = isLoading;

  submitButton.textContent =
    isLoading
      ? "Creating Account..."
      : "Create Student Account";
}


function showSignupMessage(text, type) {
  message.textContent = text;

  if (type === "success") {
    message.style.color = "#81C784";
    return;
  }

  if (type === "info") {
    message.style.color = "#FFD400";
    return;
  }

  message.style.color = "#EF9A9A";
}


function getFriendlySignupError(errorCode) {
  const messages = {
    "auth/email-already-in-use":
      "An account already exists for this email address.",

    "auth/invalid-email":
      "Please enter a valid email address.",

    "auth/weak-password":
      "Please choose a stronger password.",

    "auth/operation-not-allowed":
      "Student registration is not enabled yet.",

    "auth/too-many-requests":
      "Too many attempts. Please wait and try again.",

    "permission-denied":
      "Registration permission was denied. Check the Firestore rules."
  };

  return (
    messages[errorCode] ||
    "The account could not be created. Please try again."
  );
}