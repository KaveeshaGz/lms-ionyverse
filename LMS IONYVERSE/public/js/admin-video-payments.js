/* ======================================================
   BROWSE A TEACHER LMS
   ADMIN VIDEO PAYMENT APPROVALS
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
  serverTimestamp,
  writeBatch
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";


import {
  ref,
  getBlob
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-storage.js";


let adminVideoPaymentsConnected =
  false;


let adminVideoPaymentRequests =
  [];


let activeSlipObjectUrl =
  "";


/* ------------------------------------------------------
   SAFE TEXT OUTPUT
------------------------------------------------------ */

function escapeAdminPaymentText(
  value
) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function formatAdminPaymentLkr(
  value
) {
  return (
    "LKR " +
    Number(value || 0)
      .toLocaleString(
        "en-LK"
      )
  );
}


function formatAdminPaymentDate(
  timestamp
) {
  if (
    !timestamp?.toDate
  ) {
    return "Pending timestamp";
  }


  return timestamp
    .toDate()
    .toLocaleString(
      "en-LK",
      {
        year:
          "numeric",

        month:
          "short",

        day:
          "2-digit",

        hour:
          "2-digit",

        minute:
          "2-digit"
      }
    );
}


/* ======================================================
   CREATE SIDEBAR ITEM AND ADMIN PANEL
====================================================== */

function createAdminVideoPaymentsPage() {
  const sidebar =
    document.querySelector(
      ".admin-side"
    );


  const main =
    document.querySelector(
      ".admin-main"
    );


  const dashboardPanel =
    document.getElementById(
      "admin-panel-dashboard"
    );


  const paymentSettingsNav =
    document.getElementById(
      "admin-nav-payment-settings"
    );


  /*
    Wait until:
    1. admin.js creates its panels
    2. admin-payment-settings.js creates Payments
  */
  if (
    !sidebar ||
    !main ||
    !dashboardPanel ||
    !paymentSettingsNav
  ) {
    return false;
  }


  /* ------------------------------------------------------
     ADD VIDEO PAYMENTS SIDEBAR ITEM
  ------------------------------------------------------ */

  if (
    !document.getElementById(
      "admin-nav-video-payments"
    )
  ) {
    const navItem =
      document.createElement(
        "div"
      );


    navItem.id =
      "admin-nav-video-payments";


    navItem.className =
      "admin-nav-item";


    navItem.innerHTML = `
      <div class="admin-nav-dot"></div>

      ðŸ§¾ Video Payments
    `;


    paymentSettingsNav
      .insertAdjacentElement(
        "beforebegin",
        navItem
      );
  }


  /* ------------------------------------------------------
     REPAIR INCORRECTLY NESTED PANEL
  ------------------------------------------------------ */

  const existingPanel =
    document.getElementById(
      "admin-panel-video-payments"
    );


  if (
    existingPanel &&
    existingPanel.parentElement !==
      main
  ) {
    main.appendChild(
      existingPanel
    );
  }


  /* ------------------------------------------------------
     CREATE VIDEO PAYMENTS PANEL
  ------------------------------------------------------ */

  if (
    !document.getElementById(
      "admin-panel-video-payments"
    )
  ) {
    const panel =
      document.createElement(
        "section"
      );


    panel.id =
      "admin-panel-video-payments";


    panel.className =
      "admin-panel";


    panel.innerHTML = `
      <div class="section-head">

        <div class="section-label">
          Payments âœ¦
        </div>

        <div class="page-title">
          Video Payments
        </div>

        <div class="page-subtitle">
          Review student bank slips and grant
          access to paid Cloudflare videos.
        </div>

      </div>


      <div style="
        display:grid;
        grid-template-columns:
          repeat(
            auto-fit,
            minmax(150px, 1fr)
          );
        gap:14px;
        margin-bottom:24px;
      ">

        <div class="admin-page-card">
          <div class="form-label">
            Total Requests
          </div>

          <div
            id="video-payment-count-total"
            style="
              margin-top:8px;
              color:var(--yellow);
              font-family:var(--mono);
              font-size:26px;
            ">
            0
          </div>
        </div>


        <div class="admin-page-card">
          <div class="form-label">
            Pending
          </div>

          <div
            id="video-payment-count-pending"
            style="
              margin-top:8px;
              color:var(--pastel-lilac);
              font-family:var(--mono);
              font-size:26px;
            ">
            0
          </div>
        </div>


        <div class="admin-page-card">
          <div class="form-label">
            Approved
          </div>

          <div
            id="video-payment-count-approved"
            style="
              margin-top:8px;
              color:var(--pastel-mint);
              font-family:var(--mono);
              font-size:26px;
            ">
            0
          </div>
        </div>


        <div class="admin-page-card">
          <div class="form-label">
            Rejected
          </div>

          <div
            id="video-payment-count-rejected"
            style="
              margin-top:8px;
              color:var(--pastel-peach);
              font-family:var(--mono);
              font-size:26px;
            ">
            0
          </div>
        </div>

      </div>


      <div class="table-wrap">

        <div class="table-head-row">

          <div class="table-title">
            Video Payment Requests
          </div>


          <div style="
            display:flex;
            align-items:center;
            gap:10px;
            flex-wrap:wrap;
          ">

            <input
              id="admin-video-payment-search"
              class="table-search"
              type="search"
              placeholder="Search payments...">


            <button
              id="refresh-admin-video-payments"
              class="act-btn"
              type="button">

              Refresh

            </button>

          </div>

        </div>


        <table>

          <thead>
            <tr>
              <th>Student</th>
              <th>Video</th>
              <th>Amount</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>


          <tbody id="admin-video-payments-body">

            <tr>
              <td colspan="6">
                Loading payment requests...
              </td>
            </tr>

          </tbody>

        </table>

      </div>
    `;


    main.appendChild(
      panel
    );
  }


  return true;
}


/* ======================================================
   CREATE PRIVATE SLIP PREVIEW MODAL
====================================================== */

function ensureAdminSlipModal() {
  if (
    document.getElementById(
      "admin-video-slip-modal"
    )
  ) {
    return;
  }


  const style =
    document.createElement(
      "style"
    );


  style.textContent = `
    .admin-video-slip-modal {
      position:fixed;
      inset:0;
      z-index:10050;
      display:none;
      align-items:center;
      justify-content:center;
      padding:20px;
      background:rgba(0,0,0,0.88);
    }

    .admin-video-slip-modal.open {
      display:flex;
    }

    .admin-video-slip-card {
      position:relative;
      width:min(950px,100%);
      max-height:92vh;
      overflow:auto;
      padding:22px;
      border:1px solid var(--ivory-border);
      border-radius:var(--radius);
      background:var(--card-bg);
    }

    .admin-video-slip-head {
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap:14px;
      padding-bottom:14px;
      border-bottom:1px solid var(--ivory-border);
    }

    .admin-video-slip-title {
      color:var(--ivory);
      font-family:var(--serif);
      font-size:25px;
    }

    .admin-video-slip-meta {
      margin-top:5px;
      color:var(--ivory-dim);
      font-size:12px;
      line-height:1.7;
    }

    .admin-video-slip-close {
      border:none;
      background:transparent;
      color:var(--ivory);
      cursor:pointer;
      font-size:28px;
      line-height:1;
    }

    .admin-video-slip-preview {
      margin-top:18px;
      min-height:260px;
      display:flex;
      align-items:center;
      justify-content:center;
      border:1px solid var(--ivory-border);
      border-radius:var(--radius);
      overflow:hidden;
      background:#080808;
    }

    .admin-video-slip-preview img {
      display:block;
      max-width:100%;
      max-height:72vh;
      object-fit:contain;
    }

    .admin-video-slip-preview iframe {
      width:100%;
      min-height:72vh;
      border:0;
      background:#fff;
    }
  `;


  document.head.appendChild(
    style
  );


  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div
        id="admin-video-slip-modal"
        class="admin-video-slip-modal">

        <div class="admin-video-slip-card">

          <div class="admin-video-slip-head">

            <div>

              <div
                id="admin-video-slip-title"
                class="admin-video-slip-title">

                Payment Slip

              </div>


              <div
                id="admin-video-slip-meta"
                class="admin-video-slip-meta">
              </div>

            </div>


            <button
              id="admin-video-slip-close"
              class="admin-video-slip-close"
              type="button">

              Ã—

            </button>

          </div>


          <div
            id="admin-video-slip-preview"
            class="admin-video-slip-preview">

            Loading private payment slip...

          </div>

        </div>

      </div>
    `
  );


  document
    .getElementById(
      "admin-video-slip-close"
    )
    .addEventListener(
      "click",
      closeAdminVideoSlipModal
    );


  document
    .getElementById(
      "admin-video-slip-modal"
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
          closeAdminVideoSlipModal();
        }
      }
    );
}


/* ======================================================
   OPEN VIDEO PAYMENTS PAGE
====================================================== */

async function openAdminVideoPaymentsPage() {
  const main =
    document.querySelector(
      ".admin-main"
    );


  const paymentsPanel =
    document.getElementById(
      "admin-panel-video-payments"
    );


  /*
    Ensure this panel is not nested inside
    another hidden admin panel.
  */
  if (
    main &&
    paymentsPanel &&
    paymentsPanel.parentElement !==
      main
  ) {
    main.appendChild(
      paymentsPanel
    );
  }


  document
    .querySelectorAll(
      ".admin-panel"
    )
    .forEach(
      function (
        panel
      ) {
        panel.classList.remove(
          "active"
        );
      }
    );


  document
    .querySelectorAll(
      ".admin-nav-item"
    )
    .forEach(
      function (
        item
      ) {
        item.classList.remove(
          "active"
        );
      }
    );


  paymentsPanel
    ?.classList
    .add(
      "active"
    );


  document
    .getElementById(
      "admin-nav-video-payments"
    )
    ?.classList
    .add(
      "active"
    );


  await loadAdminVideoPayments();
}


/* ======================================================
   LOAD VIDEO PAYMENT REQUESTS
====================================================== */

async function loadAdminVideoPayments() {
  const tableBody =
    document.getElementById(
      "admin-video-payments-body"
    );


  if (
    !tableBody
  ) {
    return;
  }


  tableBody.innerHTML = `
    <tr>
      <td colspan="6">
        Loading payment requests...
      </td>
    </tr>
  `;


  try {
    const snapshot =
      await getDocs(
        collection(
          db,
          "videoPurchaseRequests"
        )
      );


    adminVideoPaymentRequests =
      snapshot.docs.map(
        function (
          requestDocument
        ) {
          return {
            id:
              requestDocument.id,

            ...requestDocument.data()
          };
        }
      );


    adminVideoPaymentRequests.sort(
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


    renderAdminVideoPayments();


  } catch (error) {
    console.error(
      "Video payments could not be loaded:",
      error
    );


    tableBody.innerHTML = `
      <tr>
        <td colspan="6">
          Payment requests could not be loaded.
          Check the browser Console.
        </td>
      </tr>
    `;
  }
}


/* ======================================================
   PAYMENT STATUS DISPLAY
====================================================== */

function createAdminVideoPaymentStatusBadge(
  status
) {
  if (
    status ===
    "approved"
  ) {
    return `
      <span class="badge badge-green">
        Approved
      </span>
    `;
  }


  if (
    status ===
    "rejected"
  ) {
    return `
      <span class="badge badge-red">
        Rejected
      </span>
    `;
  }


  return `
    <span class="badge badge-yellow">
      Pending
    </span>
  `;
}


/* ======================================================
   UPDATE SUMMARY COUNTS
====================================================== */

function updateAdminVideoPaymentCounts() {
  const total =
    adminVideoPaymentRequests.length;


  const pending =
    adminVideoPaymentRequests.filter(
      function (
        request
      ) {
        return request.status ===
          "pending";
      }
    ).length;


  const approved =
    adminVideoPaymentRequests.filter(
      function (
        request
      ) {
        return request.status ===
          "approved";
      }
    ).length;


  const rejected =
    adminVideoPaymentRequests.filter(
      function (
        request
      ) {
        return request.status ===
          "rejected";
      }
    ).length;


  document
    .getElementById(
      "video-payment-count-total"
    )
    .textContent =
      String(total);


  document
    .getElementById(
      "video-payment-count-pending"
    )
    .textContent =
      String(pending);


  document
    .getElementById(
      "video-payment-count-approved"
    )
    .textContent =
      String(approved);


  document
    .getElementById(
      "video-payment-count-rejected"
    )
    .textContent =
      String(rejected);
}


/* ======================================================
   RENDER PAYMENT TABLE
====================================================== */

function renderAdminVideoPayments() {
  const tableBody =
    document.getElementById(
      "admin-video-payments-body"
    );


  const searchInput =
    document.getElementById(
      "admin-video-payment-search"
    );


  if (
    !tableBody
  ) {
    return;
  }


  updateAdminVideoPaymentCounts();


  const searchText =
    String(
      searchInput?.value ||
      ""
    )
      .trim()
      .toLowerCase();


  const visibleRequests =
    adminVideoPaymentRequests.filter(
      function (
        request
      ) {
        const text =
          [
            request.studentName,
            request.studentEmail,
            request.videoTitle,
            request.status,
            request.amountLkr
          ]
            .join(" ")
            .toLowerCase();


        return text.includes(
          searchText
        );
      }
    );


  if (
    visibleRequests.length ===
    0
  ) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6">
          No video payment requests were found.
        </td>
      </tr>
    `;


    return;
  }


  tableBody.innerHTML =
    visibleRequests
      .map(
        function (
          request
        ) {
          const requestId =
            escapeAdminPaymentText(
              request.id
            );


          const pendingActions =
            request.status ===
            "pending"
              ? `
                <button
                  class="act-btn"
                  type="button"
                  data-video-payment-action="approve"
                  data-request-id="${requestId}">

                  Approve

                </button>


                <button
                  class="act-btn danger"
                  type="button"
                  data-video-payment-action="reject"
                  data-request-id="${requestId}">

                  Reject

                </button>
              `
              : "";


          return `
            <tr>

              <td>
                ${escapeAdminPaymentText(
                  request.studentName
                )}

                <div style="
                  margin-top:3px;
                  color:var(--ivory-dim);
                  font-size:10px;
                ">
                  ${escapeAdminPaymentText(
                    request.studentEmail
                  )}
                </div>
              </td>


              <td>
                ${escapeAdminPaymentText(
                  request.videoTitle
                )}
              </td>


              <td>
                ${formatAdminPaymentLkr(
                  request.amountLkr
                )}
              </td>


              <td>
                ${escapeAdminPaymentText(
                  formatAdminPaymentDate(
                    request.createdAt
                  )
                )}
              </td>


              <td>
                ${createAdminVideoPaymentStatusBadge(
                  request.status
                )}
              </td>


              <td>

                <div class="action-row">

                  <button
                    class="act-btn"
                    type="button"
                    data-video-payment-action="view-slip"
                    data-request-id="${requestId}">

                    View Slip

                  </button>


                  ${pendingActions}

                </div>

              </td>

            </tr>
          `;
        }
      )
      .join("");
}


/* ======================================================
   VIEW PRIVATE PAYMENT SLIP
====================================================== */

async function viewAdminVideoPaymentSlip(
  requestId
) {
  const request =
    adminVideoPaymentRequests.find(
      function (
        item
      ) {
        return item.id ===
          requestId;
      }
    );


  if (
    !request ||
    !request.slipStoragePath
  ) {
    alert(
      "The payment slip path could not be found."
    );

    return;
  }


  const modal =
    document.getElementById(
      "admin-video-slip-modal"
    );


  const title =
    document.getElementById(
      "admin-video-slip-title"
    );


  const meta =
    document.getElementById(
      "admin-video-slip-meta"
    );


  const preview =
    document.getElementById(
      "admin-video-slip-preview"
    );


  title.textContent =
    request.videoTitle ||
    "Payment Slip";


  meta.textContent =
    (
      request.studentName ||
      "Student"
    )

    +
    " Â· " +
    formatAdminPaymentLkr(
      request.amountLkr
    );


  preview.textContent =
    "Loading private payment slip...";


  modal.classList.add(
    "open"
  );


  document.body.style.overflow =
    "hidden";


  try {
    const slipBlob =
      await getBlob(
        ref(
          storage,
          request.slipStoragePath
        )
      );


    if (
      activeSlipObjectUrl
    ) {
      URL.revokeObjectURL(
        activeSlipObjectUrl
      );
    }


    activeSlipObjectUrl =
      URL.createObjectURL(
        slipBlob
      );


    if (
      slipBlob.type ===
      "application/pdf"
    ) {
      preview.innerHTML = `
        <iframe
          src="${activeSlipObjectUrl}"
          title="Private payment slip PDF">
        </iframe>
      `;


      return;
    }


    preview.innerHTML = `
      <img
        src="${activeSlipObjectUrl}"
        alt="Private payment slip preview">
    `;


  } catch (error) {
    console.error(
      "Private payment slip could not be loaded:",
      error
    );


    preview.textContent =
      "The private payment slip could not be loaded.";


    alert(
      "The payment slip could not be opened. Check the browser Console."
    );
  }
}


/* ======================================================
   CLOSE SLIP MODAL
====================================================== */

function closeAdminVideoSlipModal() {
  document
    .getElementById(
      "admin-video-slip-modal"
    )
    ?.classList
    .remove(
      "open"
    );


  document.body.style.overflow =
    "";


  if (
    activeSlipObjectUrl
  ) {
    URL.revokeObjectURL(
      activeSlipObjectUrl
    );


    activeSlipObjectUrl =
      "";
  }


  const preview =
    document.getElementById(
      "admin-video-slip-preview"
    );


  if (
    preview
  ) {
    preview.textContent =
      "";
  }
}


/* ======================================================
   APPROVE PAYMENT AND GRANT ACCESS
====================================================== */

async function approveAdminVideoPayment(
  requestId
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


  const confirmed =
    confirm(
      "Approve this payment and grant access to the paid video?"
    );


  if (
    !confirmed
  ) {
    return;
  }


  try {
    const requestReference =
      doc(
        db,
        "videoPurchaseRequests",
        requestId
      );


    const requestSnapshot =
      await getDoc(
        requestReference
      );


    if (
      !requestSnapshot.exists()
    ) {
      alert(
        "The payment request could not be found."
      );

      return;
    }


    const request =
      requestSnapshot.data();


    if (
      request.status !==
      "pending"
    ) {
      alert(
        "This payment request has already been reviewed."
      );

      return;
    }


    const videoSnapshot =
      await getDoc(
        doc(
          db,
          "videos",
          request.videoId
        )
      );


    if (
      !videoSnapshot.exists()
    ) {
      alert(
        "The selected video no longer exists."
      );

      return;
    }


    const accessId =
      request.studentUid +
      "_" +
      request.videoId;


    const batch =
      writeBatch(
        db
      );


    batch.update(
      requestReference,
      {
        status:
          "approved",

        reviewedAt:
          serverTimestamp(),

        reviewedBy:
          user.uid,

        rejectionReason:
          ""
      }
    );


    batch.set(
      doc(
        db,
        "videoAccess",
        accessId
      ),
      {
        studentUid:
          request.studentUid,

        videoId:
          request.videoId,

        videoTitle:
          request.videoTitle,

        active:
          true,

        purchaseRequestId:
          requestId,

        grantedAt:
          serverTimestamp(),

        grantedBy:
          user.uid
      },

      {
        merge:
          true
      }
    );


    await batch.commit();


    alert(
      "Payment approved. The student now has video access."
    );


    await loadAdminVideoPayments();


  } catch (error) {
    console.error(
      "Video payment approval failed:",
      error
    );


    alert(
      "The payment could not be approved. Check the browser Console."
    );
  }
}


/* ======================================================
   REJECT PAYMENT REQUEST
====================================================== */

async function rejectAdminVideoPayment(
  requestId
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


  const reason =
    prompt(
      "Enter a short reason for rejecting this payment slip:"
    );


  if (
    reason ===
    null
  ) {
    return;
  }


  const safeReason =
    reason
      .trim()
      .slice(
        0,
        300
      );


  if (
    !safeReason
  ) {
    alert(
      "Please enter a rejection reason."
    );

    return;
  }


  try {
    const requestReference =
      doc(
        db,
        "videoPurchaseRequests",
        requestId
      );


    const requestSnapshot =
      await getDoc(
        requestReference
      );


    if (
      !requestSnapshot.exists()
    ) {
      alert(
        "The payment request could not be found."
      );

      return;
    }


    if (
      requestSnapshot.data()
        .status !==
      "pending"
    ) {
      alert(
        "This payment request has already been reviewed."
      );

      return;
    }


    const batch =
      writeBatch(
        db
      );


    batch.update(
      requestReference,
      {
        status:
          "rejected",

        reviewedAt:
          serverTimestamp(),

        reviewedBy:
          user.uid,

        rejectionReason:
          safeReason
      }
    );


    await batch.commit();


    alert(
      "Payment request rejected."
    );


    await loadAdminVideoPayments();


  } catch (error) {
    console.error(
      "Video payment rejection failed:",
      error
    );


    alert(
      "The payment request could not be rejected."
    );
  }
}


/* ======================================================
   CONNECT ADMIN VIDEO PAYMENTS
====================================================== */

function connectAdminVideoPayments() {
  if (
    adminVideoPaymentsConnected
  ) {
    return;
  }


  const pageCreated =
    createAdminVideoPaymentsPage();


  if (
    !pageCreated
  ) {
    return;
  }


  ensureAdminSlipModal();


  document
    .getElementById(
      "admin-nav-video-payments"
    )
    .addEventListener(
      "click",
      openAdminVideoPaymentsPage
    );


  document
    .getElementById(
      "refresh-admin-video-payments"
    )
    .addEventListener(
      "click",
      loadAdminVideoPayments
    );


  document
    .getElementById(
      "admin-video-payment-search"
    )
    .addEventListener(
      "input",
      renderAdminVideoPayments
    );


  document.addEventListener(
    "click",
    function (
      event
    ) {
      const button =
        event.target.closest(
          "[data-video-payment-action]"
        );


      if (
        !button
      ) {
        return;
      }


      const action =
        button.dataset
          .videoPaymentAction;


      const requestId =
        button.dataset
          .requestId;


      if (
        !requestId
      ) {
        return;
      }


      if (
        action ===
        "view-slip"
      ) {
        viewAdminVideoPaymentSlip(
          requestId
        );

        return;
      }


      if (
        action ===
        "approve"
      ) {
        approveAdminVideoPayment(
          requestId
        );

        return;
      }


      if (
        action ===
        "reject"
      ) {
        rejectAdminVideoPayment(
          requestId
        );
      }
    }
  );


  document.addEventListener(
    "keydown",
    function (
      event
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        closeAdminVideoSlipModal();
      }
    }
  );


  adminVideoPaymentsConnected =
    true;


  console.log(
    "Admin video payments connected."
  );
}


/* ======================================================
   WAIT UNTIL ADMIN PANELS EXIST
====================================================== */

function attemptAdminVideoPaymentsSetup() {
  if (
    adminVideoPaymentsConnected
  ) {
    return;
  }


  connectAdminVideoPayments();
}


document.addEventListener(
  "DOMContentLoaded",
  attemptAdminVideoPaymentsSetup
);


const adminVideoPaymentsObserver =
  new MutationObserver(
    function () {
      attemptAdminVideoPaymentsSetup();


      if (
        adminVideoPaymentsConnected
      ) {
        adminVideoPaymentsObserver
          .disconnect();
      }
    }
  );


adminVideoPaymentsObserver.observe(
  document.documentElement,
  {
    childList:
      true,

    subtree:
      true
  }
);
