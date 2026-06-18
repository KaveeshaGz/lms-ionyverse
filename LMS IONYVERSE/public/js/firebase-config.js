/* ======================================================
   FIREBASE CONNECTION
====================================================== */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getStorage
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-storage.js";


const firebaseConfig = {
  apiKey: "AIzaSyAIAHpLBmOFT1qOBA_hu9hX47MJRsw0XyI",
  authDomain: "browse-a-teacher-lms.firebaseapp.com",
  projectId: "browse-a-teacher-lms",
  storageBucket: "browse-a-teacher-lms.firebasestorage.app",
  messagingSenderId: "216481615085",
  appId: "1:216481615085:web:bdee245ad1d783815b10e4",
  measurementId: "G-70VHL52TL2"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);

export {
  app,
  auth,
  db,
  storage
};