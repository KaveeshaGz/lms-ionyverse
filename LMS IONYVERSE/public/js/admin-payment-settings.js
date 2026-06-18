/* ======================================================
   BROWSE A TEACHER LMS
   ADMIN BANK-TRANSFER SETTINGS
====================================================== */

import {
  auth,
  db
} from "./firebase-config.js";


import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";


let adminPaymentSettingsConnected =
  false;


/* ------------------------------------------------------
   CREATE SIDEBAR ITEM AND PANEL
------------------------------------------------------ */
function createAdminPaymentSettingsPage() {
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


  /*
    Wait until admin.js finishes wrapping the
    original dashboard content.

    Creating this page before that step would place
    the payment form inside the hidden dashboard panel.
  */
  if (
    !sidebar ||
    !main ||
    !dashboardPanel
  ) {
    return false;
  }


  /* ------------------------------------------------------
     ADD SIDEBAR ITEM
  ------------------------------------------------------ */

  if (
    !document.getElementById(
      "admin-nav-payment-settings"
    )
  ) {
    const groups =
      sidebar.querySelectorAll(
        ".admin-nav-group"
      );


    const accountGroup =
      groups[
        groups.length - 1
      ];


    const paymentsGroup =
      document.createElement(
        "div"
      );


    paymentsGroup.className =
      "admin-nav-group";


    paymentsGroup.innerHTML = `
      <div class="admin-nav-label">
        Payments
      </div>

      <div
        id="admin-nav-payment-settings"
        class="admin-nav-item">

        <div class="admin-nav-dot"></div>

        🏦 Payment Settings

      </div>
    `;


    if (
      accountGroup
    ) {
      accountGroup.insertAdjacentElement(
        "beforebegin",
        paymentsGroup
      );

    } else {
      sidebar.appendChild(
        paymentsGroup
      );
    }
  }


  /* ------------------------------------------------------
     REPAIR AN EARLY-CREATED NESTED PANEL
  ------------------------------------------------------ */

  const existingPanel =
    document.getElementById(
      "admin-panel-payment-settings"
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
     CREATE SETTINGS PANEL
  ------------------------------------------------------ */

  if (
    !document.getElementById(
      "admin-panel-payment-settings"
    )
  ) {
    const panel =
      document.createElement(
        "section"
      );


    panel.id =
      "admin-panel-payment-settings";


    panel.className =
      "admin-panel";


    panel.innerHTML = `
      <div class="section-head">

        <div class="section-label">
          Payments ✦
        </div>

        <div class="page-title">
          Payment Settings
        </div>

        <div class="page-subtitle">
          Add the bank-transfer details shown to
          students when they purchase paid videos.
        </div>

      </div>


      <form
        id="admin-payment-settings-form"
        class="admin-page-card">

        <div class="db-recent">
          Bank Transfer Details
        </div>


        <div
          class="form-group"
          style="margin-bottom:20px">

          <label class="form-label">
            Accept Bank Transfers
          </label>

          <label style="
            display:flex;
            align-items:center;
            gap:10px;
            color:var(--ivory);
            font-size:13px;
          ">

            <input
              id="payment-settings-enabled"
              type="checkbox">

            Show payment details to students

          </label>

        </div>


        <div class="form-grid">

          <div class="form-group">

            <label class="form-label">
              Bank Name
            </label>

            <input
              id="payment-settings-bank-name"
              class="form-input"
              type="text"
              maxlength="120"
              placeholder="Example: Commercial Bank"
              required>

          </div>


          <div class="form-group">

            <label class="form-label">
              Account Holder Name
            </label>

            <input
              id="payment-settings-holder-name"
              class="form-input"
              type="text"
              maxlength="160"
              placeholder="Account holder name"
              required>

          </div>


          <div class="form-group">

            <label class="form-label">
              Account Number
            </label>

            <input
              id="payment-settings-account-number"
              class="form-input"
              type="text"
              maxlength="80"
              placeholder="Bank account number"
              required>

          </div>


          <div class="form-group">

            <label class="form-label">
              Branch
            </label>

            <input
              id="payment-settings-branch"
              class="form-input"
              type="text"
              maxlength="120"
              placeholder="Example: Colombo Branch"
              required>

          </div>

        </div>


        <div
          class="form-group"
          style="margin-bottom:22px">

          <label class="form-label">
            Payment Instructions
          </label>

          <textarea
            id="payment-settings-instructions"
            class="form-input"
            rows="5"
            maxlength="1200"
            placeholder="Transfer the exact amount and upload a clear image or PDF of the bank slip."
            style="resize:vertical"
            required>
          </textarea>

        </div>


        <button
          id="save-payment-settings"
          type="submit"
          class="btn-large btn-yellow">

          Save Payment Settings

        </button>

      </form>
    `;


    main.appendChild(
      panel
    );
  }


  return true;
}

/* ------------------------------------------------------
   OPEN PAYMENT SETTINGS PANEL
------------------------------------------------------ */

async function openAdminPaymentSettingsPage() {
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


    const main =
    document.querySelector(
      ".admin-main"
    );


  const paymentPanel =
    document.getElementById(
      "admin-panel-payment-settings"
    );


  /*
    Ensure the settings page is a direct child
    of the admin main area.
  */
  if (
    main &&
    paymentPanel &&
    paymentPanel.parentElement !==
      main
  ) {
    main.appendChild(
      paymentPanel
    );
  }

  const panel =
    document.getElementById(
      "admin-panel-payment-settings"
    );


  const navItem =
    document.getElementById(
      "admin-nav-payment-settings"
    );


  if (
    panel
  ) {
    panel.classList.add(
      "active"
    );
  }


  if (
    navItem
  ) {
    navItem.classList.add(
      "active"
    );
  }


  await loadAdminPaymentSettings();
}


/* ------------------------------------------------------
   LOAD SAVED SETTINGS
------------------------------------------------------ */

async function loadAdminPaymentSettings() {
  try {
    const settingsSnapshot =
      await getDoc(
        doc(
          db,
          "paymentSettings",
          "bankTransfer"
        )
      );


    if (
      !settingsSnapshot.exists()
    ) {
      return;
    }


    const settings =
      settingsSnapshot.data();


    document
      .getElementById(
        "payment-settings-enabled"
      )
      .checked =
        settings.enabled ===
        true;


    document
      .getElementById(
        "payment-settings-bank-name"
      )
      .value =
        settings.bankName ||
        "";


    document
      .getElementById(
        "payment-settings-holder-name"
      )
      .value =
        settings.accountHolderName ||
        "";


    document
      .getElementById(
        "payment-settings-account-number"
      )
      .value =
        settings.accountNumber ||
        "";


    document
      .getElementById(
        "payment-settings-branch"
      )
      .value =
        settings.branchName ||
        "";


    document
      .getElementById(
        "payment-settings-instructions"
      )
      .value =
        settings.instructions ||
        "";


  } catch (error) {
    console.error(
      "Payment settings could not be loaded:",
      error
    );


    alert(
      "Payment settings could not be loaded."
    );
  }
}


/* ------------------------------------------------------
   SAVE SETTINGS
------------------------------------------------------ */

async function saveAdminPaymentSettings(
  event
) {
  event.preventDefault();


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


  const enabled =
    document
      .getElementById(
        "payment-settings-enabled"
      )
      .checked;


  const bankName =
    document
      .getElementById(
        "payment-settings-bank-name"
      )
      .value
      .trim();


  const accountHolderName =
    document
      .getElementById(
        "payment-settings-holder-name"
      )
      .value
      .trim();


  const accountNumber =
    document
      .getElementById(
        "payment-settings-account-number"
      )
      .value
      .trim();


  const branchName =
    document
      .getElementById(
        "payment-settings-branch"
      )
      .value
      .trim();


  const instructions =
    document
      .getElementById(
        "payment-settings-instructions"
      )
      .value
      .trim();


  if (
    !bankName ||
    !accountHolderName ||
    !accountNumber ||
    !branchName ||
    !instructions
  ) {
    alert(
      "Please complete every bank-detail field."
    );

    return;
  }


  const saveButton =
    document.getElementById(
      "save-payment-settings"
    );


  saveButton.disabled =
    true;


  saveButton.textContent =
    "Saving...";


  try {
    await setDoc(
      doc(
        db,
        "paymentSettings",
        "bankTransfer"
      ),

      {
        enabled:
          enabled,

        bankName:
          bankName,

        accountHolderName:
          accountHolderName,

        accountNumber:
          accountNumber,

        branchName:
          branchName,

        instructions:
          instructions,

        updatedBy:
          user.uid,

        updatedAt:
          serverTimestamp()
      },

      {
        merge:
          true
      }
    );


    alert(
      "Payment settings saved successfully."
    );


  } catch (error) {
    console.error(
      "Payment settings save failed:",
      error
    );


    alert(
      "Payment settings could not be saved."
    );


  } finally {
    saveButton.disabled =
      false;


    saveButton.textContent =
      "Save Payment Settings";
  }
}


/* ------------------------------------------------------
   CONNECT MODULE
------------------------------------------------------ */

function connectAdminPaymentSettings() {
  if (
    adminPaymentSettingsConnected
  ) {
    return;
  }


  const pageCreated =
    createAdminPaymentSettingsPage();


  if (
    !pageCreated
  ) {
    return;
  }


  document
    .getElementById(
      "admin-nav-payment-settings"
    )
    .addEventListener(
      "click",
      openAdminPaymentSettingsPage
    );


  document
    .getElementById(
      "admin-payment-settings-form"
    )
    .addEventListener(
      "submit",
      saveAdminPaymentSettings
    );


  adminPaymentSettingsConnected =
    true;


  console.log(
    "Admin payment settings connected."
  );
}


/* ------------------------------------------------------
   WAIT UNTIL ADMIN DASHBOARD EXISTS
------------------------------------------------------ */

function attemptAdminPaymentSettingsSetup() {
  if (
    adminPaymentSettingsConnected
  ) {
    return;
  }


  connectAdminPaymentSettings();
}


document.addEventListener(
  "DOMContentLoaded",
  attemptAdminPaymentSettingsSetup
);


const adminPaymentSettingsObserver =
  new MutationObserver(
    function () {
      attemptAdminPaymentSettingsSetup();


      if (
        adminPaymentSettingsConnected
      ) {
        adminPaymentSettingsObserver
          .disconnect();
      }
    }
  );


adminPaymentSettingsObserver.observe(
  document.documentElement,
  {
    childList:
      true,

    subtree:
      true
  }
);