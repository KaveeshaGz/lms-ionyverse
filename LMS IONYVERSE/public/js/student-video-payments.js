/* ======================================================
   BROWSE A TEACHER LMS
   STUDENT VIDEO PAYMENT-SLIP UPLOAD
====================================================== */

import {
  auth,
  db,
  storage
} from "./firebase-config.js";


import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  serverTimestamp,
  where
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";


import {
  ref,
  uploadBytes,
  deleteObject
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-storage.js";


let selectedPaidVideo =
  null;


/* ------------------------------------------------------
   SAFE OUTPUT
------------------------------------------------------ */

function safePaymentText(
  value
) {
  return String(
    value ||
    ""
  );
}


function safeSlipFileName(
  value
) {
  return String(
    value ||
    "payment-slip"
  )
    .replace(
      /[^a-zA-Z0-9._-]/g,
      "-"
    )
    .slice(
      0,
      120
    );
}


function formatPaymentLkr(
  value
) {
  return (
    "LKR " +
    Number(
      value ||
      0
    ).toLocaleString(
      "en-LK"
    )
  );
}


/* ======================================================
   CREATE PAYMENT MODAL
====================================================== */

function ensureStudentPaymentModal() {
  if (
    document.getElementById(
      "student-video-payment-modal"
    )
  ) {
    return;
  }


  const style =
    document.createElement(
      "style"
    );


  style.textContent = `
    .student-video-payment-modal {
      position:fixed;
      inset:0;
      z-index:10020;
      display:none;
      align-items:center;
      justify-content:center;
      padding:20px;
      background:rgba(0,0,0,0.86);
    }

    .student-video-payment-modal.open {
      display:flex;
    }

    .student-video-payment-card {
      position:relative;
      width:min(650px,100%);
      max-height:90vh;
      overflow:auto;
      padding:28px;
      border:1px solid var(--ivory-border);
      border-radius:var(--radius);
      background:var(--card-bg);
    }

    .student-video-payment-close {
      position:absolute;
      top:14px;
      right:16px;
      border:none;
      background:transparent;
      color:var(--ivory);
      font-size:28px;
      cursor:pointer;
    }

    .student-payment-title {
      color:var(--ivory);
      font-family:var(--serif);
      font-size:28px;
      line-height:1.15;
    }

    .student-payment-price {
      margin-top:10px;
      color:var(--yellow);
      font-family:var(--mono);
      font-size:14px;
    }

    .student-bank-details {
      margin:22px 0;
      padding:18px;
      border:1px solid var(--ivory-border);
      border-radius:var(--radius);
      background:rgba(255,255,255,0.02);
    }

    .student-bank-row {
      display:grid;
      grid-template-columns:150px 1fr;
      gap:12px;
      padding:7px 0;
      color:var(--ivory-dim);
      font-size:13px;
    }

    .student-bank-row strong {
      color:var(--ivory);
    }

    .student-payment-instructions {
      margin-top:14px;
      color:var(--ivory-dim);
      font-size:12px;
      line-height:1.75;
    }

    .student-slip-note {
      margin-top:7px;
      color:var(--ivory-dim);
      font-size:11px;
      line-height:1.6;
    }

    .student-payment-message {
      margin-top:14px;
      color:var(--yellow);
      font-size:12px;
      line-height:1.6;
    }

    @media (max-width:520px) {
      .student-bank-row {
        grid-template-columns:1fr;
        gap:2px;
      }
    }
  `;


  document.head.appendChild(
    style
  );


  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div
        id="student-video-payment-modal"
        class="student-video-payment-modal">

        <div class="student-video-payment-card">

          <button
            id="student-video-payment-close"
            class="student-video-payment-close"
            type="button">

            Ã—

          </button>


          <div class="section-label">
            Paid Video Access âœ¦
          </div>


          <div
            id="student-video-payment-title"
            class="student-payment-title">
          </div>


          <div
            id="student-video-payment-price"
            class="student-payment-price">
          </div>


          <div class="student-bank-details">

            <div class="student-bank-row">
              <strong>Bank</strong>
              <span id="student-payment-bank-name"></span>
            </div>

            <div class="student-bank-row">
              <strong>Account Holder</strong>
              <span id="student-payment-holder-name"></span>
            </div>

            <div class="student-bank-row">
              <strong>Account Number</strong>
              <span id="student-payment-account-number"></span>
            </div>

            <div class="student-bank-row">
              <strong>Branch</strong>
              <span id="student-payment-branch"></span>
            </div>

            <div
              id="student-payment-instructions"
              class="student-payment-instructions">
            </div>

          </div>


          <form id="student-video-payment-form">

            <div class="form-group">

              <label class="form-label">
                Upload Payment Slip
              </label>

              <input
                id="student-video-slip-file"
                class="admin-file-input"
                type="file"
                accept="image/*,application/pdf"
                required>

              <div class="student-slip-note">
                Accepted: JPG, PNG, WEBP, or PDF.
                Maximum size: 5 MB.
              </div>

            </div>


            <div
              id="student-video-payment-message"
              class="student-payment-message">
            </div>


            <button
              id="student-video-payment-submit"
              class="btn-large btn-yellow"
              type="submit"
              style="
                width:100%;
                margin-top:18px;
              ">

              Submit Payment Slip

            </button>

          </form>

        </div>

      </div>
    `
  );


  document
    .getElementById(
      "student-video-payment-close"
    )
    .addEventListener(
      "click",
      closeStudentPaymentModal
    );


  document
    .getElementById(
      "student-video-payment-modal"
    )
    .addEventListener(
      "click",
      function (
        event
      ) {
        if (
          event.target ===
          this
        ) {
          closeStudentPaymentModal();
        }
      }
    );


  document
    .getElementById(
      "student-video-payment-form"
    )
    .addEventListener(
      "submit",
      submitStudentVideoPayment
    );
}


/* ======================================================
   EXISTING REQUEST CHECK
====================================================== */

async function findExistingRequest(
  studentUid,
  videoId
) {
  const requestQuery =
    query(
      collection(
        db,
        "videoPurchaseRequests"
      ),

      where(
        "studentUid",
        "==",
        studentUid
      )
    );


  const snapshot =
    await getDocs(
      requestQuery
    );


  const requests =
    snapshot.docs
      .map(
        function (
          requestDocument
        ) {
          return {
            id:
              requestDocument.id,

            ...requestDocument.data()
          };
        }
      )
      .filter(
        function (
          request
        ) {
          return (
            request.videoId ===
            videoId
          );
        }
      );


  requests.sort(
    function (
      firstRequest,
      secondRequest
    ) {
      return (
        (
          secondRequest
            .createdAt
            ?.seconds ||
          0
        )

        -

        (
          firstRequest
            .createdAt
            ?.seconds ||
          0
        )
      );
    }
  );


  return (
    requests[0] ||
    null
  );
}


/* ======================================================
   OPEN PAYMENT MODAL
====================================================== */

async function openStudentPaymentModal(
  videoId
) {
  const user =
    auth.currentUser;


  if (
    !user
  ) {
    alert(
      "Please sign in again."
    );

    return;
  }


  try {
    const [
      videoSnapshot,
      settingsSnapshot,
      existingRequest
    ] =
      await Promise.all([
        getDoc(
          doc(
            db,
            "videos",
            videoId
          )
        ),

        getDoc(
          doc(
            db,
            "paymentSettings",
            "bankTransfer"
          )
        ),

        findExistingRequest(
          user.uid,
          videoId
        )
      ]);


    if (
      !videoSnapshot.exists()
    ) {
      alert(
        "The selected video could not be found."
      );

      return;
    }


    const video =
      videoSnapshot.data();


    if (
      video.status !==
      "published" ||
      video.accessType !==
      "paid"
    ) {
      alert(
        "This video is not available for purchase."
      );

      return;
    }


    if (
      existingRequest?.status ===
      "pending"
    ) {
      alert(
        "Your payment slip is already waiting for approval."
      );

      return;
    }


    if (
      existingRequest?.status ===
      "approved"
    ) {
      alert(
        "Your payment is already approved. Refresh the Videos page."
      );

      return;
    }


    if (
      !settingsSnapshot.exists()
    ) {
      alert(
        "Bank-transfer details have not been added yet."
      );

      return;
    }


    const settings =
      settingsSnapshot.data();


    if (
      settings.enabled !==
      true
    ) {
      alert(
        "Bank-transfer purchases are temporarily unavailable."
      );

      return;
    }


    selectedPaidVideo = {
      id:
        videoId,

      ...video
    };


    ensureStudentPaymentModal();


    document
      .getElementById(
        "student-video-payment-title"
      )
      .textContent =
        safePaymentText(
          video.title
        );


    document
      .getElementById(
        "student-video-payment-price"
      )
      .textContent =
        formatPaymentLkr(
          video.priceLkr
        );


    document
      .getElementById(
        "student-payment-bank-name"
      )
      .textContent =
        safePaymentText(
          settings.bankName
        );


    document
      .getElementById(
        "student-payment-holder-name"
      )
      .textContent =
        safePaymentText(
          settings.accountHolderName
        );


    document
      .getElementById(
        "student-payment-account-number"
      )
      .textContent =
        safePaymentText(
          settings.accountNumber
        );


    document
      .getElementById(
        "student-payment-branch"
      )
      .textContent =
        safePaymentText(
          settings.branchName
        );


    document
      .getElementById(
        "student-payment-instructions"
      )
      .textContent =
        safePaymentText(
          settings.instructions
        );


    document
      .getElementById(
        "student-video-payment-form"
      )
      .reset();


    document
      .getElementById(
        "student-video-payment-message"
      )
      .textContent =
        "";


    document
      .getElementById(
        "student-video-payment-modal"
      )
      .classList.add(
        "open"
      );


    document.body.style.overflow =
      "hidden";


  } catch (error) {
    console.error(
      "Paid video details could not be loaded:",
      error
    );


    alert(
      "Payment details could not be loaded."
    );
  }
}


/* ======================================================
   CLOSE PAYMENT MODAL
====================================================== */

function closeStudentPaymentModal() {
  const modal =
    document.getElementById(
      "student-video-payment-modal"
    );


  if (
    modal
  ) {
    modal.classList.remove(
      "open"
    );
  }


  document.body.style.overflow =
    "";


  selectedPaidVideo =
    null;
}


/* ======================================================
   SUBMIT PAYMENT SLIP
====================================================== */

async function submitStudentVideoPayment(
  event
) {
  event.preventDefault();


  const user =
    auth.currentUser;


  if (
    !user ||
    !selectedPaidVideo
  ) {
    alert(
      "Please reopen the selected paid video."
    );

    return;
  }


  const fileInput =
    document.getElementById(
      "student-video-slip-file"
    );


  const slipFile =
    fileInput.files[0];


  if (
    !slipFile
  ) {
    alert(
      "Please choose your payment slip."
    );

    return;
  }


  const validFile =
    slipFile.type.startsWith(
      "image/"
    )

    ||

    slipFile.type ===
      "application/pdf";


  if (
    !validFile
  ) {
    alert(
      "Please upload an image or PDF payment slip."
    );

    return;
  }


  const maximumFileSize =
    5 *
    1024 *
    1024;


  if (
    slipFile.size >
    maximumFileSize
  ) {
    alert(
      "The payment slip must be below 5 MB."
    );

    return;
  }


  const submitButton =
    document.getElementById(
      "student-video-payment-submit"
    );


  const message =
    document.getElementById(
      "student-video-payment-message"
    );


  submitButton.disabled =
    true;


  submitButton.textContent =
    "Uploading Slip...";


  message.textContent =
    "Uploading your payment slip securely...";


  let uploadedSlipReference =
    null;


  try {
    const profileSnapshot =
      await getDoc(
        doc(
          db,
          "users",
          user.uid
        )
      );


    const profile =
      profileSnapshot.exists()
        ? profileSnapshot.data()
        : {};


    const requestReference =
      doc(
        collection(
          db,
          "videoPurchaseRequests"
        )
      );


    const slipFileName =
      safeSlipFileName(
        slipFile.name
      );


    const slipStoragePath =
      "payment-slips/" +
      user.uid +
      "/" +
      requestReference.id +
      "-" +
      slipFileName;


    uploadedSlipReference =
      ref(
        storage,
        slipStoragePath
      );


    await uploadBytes(
      uploadedSlipReference,
      slipFile,
      {
        contentType:
          slipFile.type
      }
    );


    message.textContent =
      "Saving your request...";


    await setDoc(
      requestReference,
      {
        studentUid:
          user.uid,

        studentName:
          profile.name ||
          user.displayName ||
          "Student",

        studentEmail:
          user.email ||
          "",

        videoId:
          selectedPaidVideo.id,

        videoTitle:
          selectedPaidVideo.title,

        amountLkr:
          Number(
            selectedPaidVideo.priceLkr
          ),

        slipStoragePath:
          slipStoragePath,

        slipFileName:
          slipFileName,

        status:
          "pending",

        createdAt:
          serverTimestamp()
      }
    );


    message.textContent =
      "Payment slip submitted successfully.";


    alert(
      "Your payment slip was submitted. Access will be available after administrator approval."
    );


    closeStudentPaymentModal();


    if (
      typeof window
        .reloadStudentVideos ===
      "function"
    ) {
      await window
        .reloadStudentVideos();
    }


  } catch (error) {
    console.error(
      "Payment-slip submission failed:",
      error
    );


    /*
      Delete orphaned slip if Firestore saving fails.
    */
    if (
      uploadedSlipReference
    ) {
      try {
        await deleteObject(
          uploadedSlipReference
        );

      } catch (
        cleanupError
      ) {
        console.warn(
          "Payment-slip cleanup failed:",
          cleanupError
        );
      }
    }


    message.textContent =
      "The payment slip could not be submitted.";


    alert(
      "Payment-slip submission failed. Check the browser Console."
    );


  } finally {
    submitButton.disabled =
      false;


    submitButton.textContent =
      "Submit Payment Slip";
  }
}


/* ======================================================
   INTERCEPT PAID VIDEO BUY BUTTON
====================================================== */

ensureStudentPaymentModal();


document.addEventListener(
  "click",

  function (
    event
  ) {
    const buyButton =
      event.target.closest(
        '[data-student-video-action="buy"]'
      );


    if (
      !buyButton
    ) {
      return;
    }


    /*
      Stop the temporary Phase 6 popup.
    */
    event.preventDefault();

    event.stopImmediatePropagation();


    const videoId =
      buyButton.dataset
        .videoId;


    if (
      videoId
    ) {
      openStudentPaymentModal(
        videoId
      );
    }
  },

  true
);
