/* ======================================================
   BROWSE A TEACHER LMS
   STUDENT FIRESTORE PDF LIBRARY
====================================================== */

import {
  auth,
  db,
  storage
} from "./firebase-config.js";


import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";


import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";


import {
  getBlob,
  ref
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-storage.js";


let studentPdfResources =
  [];


let studentPdfRequests =
  [];


let studentPdfLibraryConnected =
  false;


/* ------------------------------------------------------
   SAFE OUTPUT
------------------------------------------------------ */

function escapeStudentPdfText(
  value
) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* ======================================================
   STYLES
====================================================== */

function ensureStudentPdfStyles() {
  if (
    document.getElementById(
      "firebase-student-pdf-styles"
    )
  ) {
    return;
  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "firebase-student-pdf-styles";


  style.textContent = `
    .student-pdf-toolbar {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:14px;
      flex-wrap:wrap;
      margin-bottom:24px;
      padding:16px 18px;
      border:1px solid var(--ivory-border);
      border-radius:var(--radius);
      background:var(--card-bg);
    }

    .student-pdf-toolbar-title {
      color:var(--ivory);
      font-family:var(--serif);
      font-size:22px;
    }

    .student-pdf-toolbar-sub {
      margin-top:3px;
      color:var(--ivory-dim);
      font-size:12px;
    }

    .student-pdf-toolbar-actions {
      display:flex;
      align-items:center;
      gap:10px;
      flex-wrap:wrap;
    }

    .student-pdf-search {
      min-width:230px;
    }

    .student-pdf-grid {
      display:grid;
      grid-template-columns:
        repeat(
          auto-fit,
          minmax(245px, 1fr)
        );
      gap:16px;
    }

    .student-pdf-card {
      display:flex;
      flex-direction:column;
      min-height:100%;
      padding:20px;
      border:1px solid var(--ivory-border);
      border-radius:var(--radius);
      background:var(--card-bg);
    }

    .student-pdf-icon {
      font-size:34px;
    }

    .student-pdf-subject {
      margin-top:15px;
      color:var(--yellow);
      font-family:var(--mono);
      font-size:10px;
      letter-spacing:0.08em;
      text-transform:uppercase;
    }

    .student-pdf-title {
      margin-top:9px;
      color:var(--ivory);
      font-family:var(--serif);
      font-size:23px;
      line-height:1.15;
    }

    .student-pdf-teacher {
      flex:1;
      margin-top:10px;
      color:var(--pastel-lilac);
      font-size:12px;
    }

    .student-pdf-access {
      margin-top:18px;
      padding-top:15px;
      border-top:1px solid var(--ivory-border);
    }

    .student-pdf-action {
      width:100%;
      margin-top:18px;
    }

    .student-pdf-empty {
      grid-column:1/-1;
      padding:40px 20px;
      border:1px dashed var(--ivory-border);
      border-radius:var(--radius);
      background:var(--card-bg);
      color:var(--ivory-dim);
      text-align:center;
      font-size:13px;
    }

    @media (max-width:680px) {
      .student-pdf-toolbar-actions {
        width:100%;
      }

      .student-pdf-search {
        width:100%;
        min-width:0;
      }
    }
  `;


  document.head.appendChild(
    style
  );
}


/* ======================================================
   REPLACE HARDCODED PDF PANEL
====================================================== */

function prepareStudentPdfPanel() {
  const panel =
    document.getElementById(
      "student-panel-pdf-library"
    );


  if (
    !panel
  ) {
    return false;
  }


  panel.innerHTML = `
    <div class="section-head">

      <div class="section-label">
        Learning Resources âœ¦
      </div>


      <div class="page-title">
        PDF Library
      </div>


      <div class="page-subtitle">
        Browse Business Studies and Chemistry PDFs
        uploaded by your teachers.
      </div>

    </div>


    <div class="student-pdf-toolbar">

      <div>

        <div class="student-pdf-toolbar-title">
          Study Materials
        </div>


        <div class="student-pdf-toolbar-sub">
          Open available PDFs or request access
          to restricted resources.
        </div>

      </div>


      <div class="student-pdf-toolbar-actions">

        <input
          id="student-pdf-search"
          class="form-input student-pdf-search"
          type="search"
          placeholder="Search PDFs...">


        <button
          id="refresh-student-pdfs"
          class="act-btn"
          type="button">

          Refresh

        </button>

      </div>

    </div>


    <div
      id="firebase-student-pdf-grid"
      class="student-pdf-grid">

      <div class="student-pdf-empty">
        Loading PDF resources...
      </div>

    </div>
  `;


  return true;
}


/* ======================================================
   LOAD STUDENT ACCESS REQUESTS
====================================================== */

async function loadStudentPdfRequests() {
  const user =
    auth.currentUser;


  studentPdfRequests =
    [];


  if (
    !user
  ) {
    return;
  }


  const requestsQuery =
    query(
      collection(
        db,
        "pdfRequests"
      ),

      where(
        "studentUid",
        "==",
        user.uid
      )
    );


  const snapshot =
    await getDocs(
      requestsQuery
    );


  studentPdfRequests =
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
            request.requestType ===
            "library-access"
          );
        }
      );
}


/* ------------------------------------------------------
   GET ACCESS STATUS
------------------------------------------------------ */

function getStudentPdfAccessStatus(
  resourceId
) {
  const requests =
    studentPdfRequests
      .filter(
        function (
          request
        ) {
          return (
            request.resourceId ===
            resourceId
          );
        }
      )
      .sort(
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
    requests[0]?.status ||
    "not-requested"
  );
}


/* ======================================================
   LOAD ACTIVE PDF RESOURCES
====================================================== */

async function loadStudentPdfResources() {
  const grid =
    document.getElementById(
      "firebase-student-pdf-grid"
    );


  if (
    !grid
  ) {
    return;
  }


  grid.innerHTML = `
    <div class="student-pdf-empty">
      Loading PDF resources...
    </div>
  `;


  try {
    const resourcesQuery =
      query(
        collection(
          db,
          "pdfResources"
        ),

        where(
          "status",
          "==",
          "active"
        )
      );


    const [
      resourcesSnapshot
    ] =
      await Promise.all([
        getDocs(
          resourcesQuery
        ),

        loadStudentPdfRequests()
      ]);


    studentPdfResources =
      resourcesSnapshot.docs
        .map(
          function (
            pdfDocument
          ) {
            return {
              id:
                pdfDocument.id,

              ...pdfDocument.data()
            };
          }
        )
        .filter(
          function (
            resource
          ) {
            return (
              resource.subject ===
                "Business Studies"

              ||

              resource.subject ===
                "Chemistry"
            );
          }
        );


    studentPdfResources.sort(
      function (
        firstResource,
        secondResource
      ) {
        return (
          (
            secondResource
              .createdAt
              ?.seconds ||
            0
          )

          -

          (
            firstResource
              .createdAt
              ?.seconds ||
            0
          )
        );
      }
    );


    renderStudentPdfResources();


  } catch (error) {
    console.error(
      "Student PDFs could not be loaded:",
      error
    );


    grid.innerHTML = `
      <div class="student-pdf-empty">
        PDF resources could not be loaded.
        Check the browser Console.
      </div>
    `;
  }
}


/* ======================================================
   ACTION BUTTON
====================================================== */

function createStudentPdfAction(
  resource
) {
  const requiresApproval =
    resource
      .approvalRequired ===
    true;


  if (
    !requiresApproval
  ) {
    return `
      <button
        class="btn-large btn-yellow student-pdf-action"
        type="button"
        data-student-pdf-action="open"
        data-pdf-id="${escapeStudentPdfText(
          resource.id
        )}">

        Open PDF

      </button>
    `;
  }


  const accessStatus =
    getStudentPdfAccessStatus(
      resource.id
    );


  if (
    accessStatus ===
    "approved"
  ) {
    return `
      <button
        class="btn-large btn-yellow student-pdf-action"
        type="button"
        data-student-pdf-action="open"
        data-pdf-id="${escapeStudentPdfText(
          resource.id
        )}">

        Open PDF

      </button>
    `;
  }


  if (
    accessStatus ===
    "pending"
  ) {
    return `
      <button
        class="btn-large btn-outline student-pdf-action"
        type="button"
        disabled>

        Pending Approval

      </button>
    `;
  }


  return `
    <button
      class="btn-large btn-outline student-pdf-action"
      type="button"
      data-student-pdf-action="request"
      data-pdf-id="${escapeStudentPdfText(
        resource.id
      )}">

      ${
        accessStatus ===
        "rejected"
          ? "Request Again"
          : "Request Access"
      }

    </button>
  `;
}


/* ======================================================
   RENDER PDF CARDS
====================================================== */

function renderStudentPdfResources() {
  const grid =
    document.getElementById(
      "firebase-student-pdf-grid"
    );


  const searchInput =
    document.getElementById(
      "student-pdf-search"
    );


  if (
    !grid
  ) {
    return;
  }


  const searchText =
    String(
      searchInput?.value ||
      ""
    )
      .trim()
      .toLowerCase();


  const visibleResources =
    studentPdfResources.filter(
      function (
        resource
      ) {
        return [
          resource.title,
          resource.subject,
          resource.teacher
        ]
          .join(" ")
          .toLowerCase()
          .includes(
            searchText
          );
      }
    );


  if (
    visibleResources.length ===
    0
  ) {
    grid.innerHTML = `
      <div class="student-pdf-empty">

        <div style="
          font-size:30px;
          margin-bottom:8px;
        ">
          ðŸ“„
        </div>

        No PDF resources are available yet.

      </div>
    `;


    return;
  }


  grid.innerHTML =
    visibleResources
      .map(
        function (
          resource
        ) {
          const requiresApproval =
            resource
              .approvalRequired ===
            true;


          return `
            <article class="student-pdf-card">

              <div class="student-pdf-icon">
                ðŸ“„
              </div>


              <div class="student-pdf-subject">
                ${escapeStudentPdfText(
                  resource.subject
                )}
              </div>


              <div class="student-pdf-title">
                ${escapeStudentPdfText(
                  resource.title
                )}
              </div>


              <div class="student-pdf-teacher">
                ${escapeStudentPdfText(
                  resource.teacher
                )}
              </div>


              <div class="student-pdf-access">

                <span class="
                  badge
                  ${
                    requiresApproval
                      ? "badge-yellow"
                      : "badge-green"
                  }
                ">

                  ${
                    requiresApproval
                      ? "Approval Required"
                      : "Available"
                  }

                </span>

              </div>


              ${createStudentPdfAction(
                resource
              )}

            </article>
          `;
        }
      )
      .join("");
}


/* ======================================================
   OPEN SECURE PDF
====================================================== */

async function openStudentPdfResource(
  resourceId
) {
  const resource =
    studentPdfResources.find(
      function (
        item
      ) {
        return item.id ===
          resourceId;
      }
    );


  if (
    !resource
  ) {
    alert(
      "The selected PDF could not be found."
    );

    return;
  }


  const accessStatus =
    getStudentPdfAccessStatus(
      resourceId
    );


  if (
    resource.approvalRequired ===
      true

    &&

    accessStatus !==
      "approved"
  ) {
    alert(
      "Administrator approval is required before opening this PDF."
    );

    return;
  }


  if (
    !resource.storagePath
  ) {
    alert(
      "The PDF Storage path is missing. Upload the file again from the admin portal."
    );

    return;
  }


  /*
    Open immediately while the click is active
    to avoid popup blocking.
  */
  const pdfWindow =
    window.open(
      "",
      "_blank"
    );


  if (
    !pdfWindow
  ) {
    alert(
      "Your browser blocked the PDF tab. Allow popups for this website."
    );

    return;
  }


  pdfWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Opening PDF...</title>

        <style>
          body {
            min-height:100vh;
            margin:0;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#0a0a0a;
            color:#f0ead6;
            font-family:Arial,sans-serif;
          }

          p {
            color:#ffd400;
          }
        </style>
      </head>

      <body>
        <div>
          <h2>Opening PDF...</h2>
          <p>Please wait âœ¦</p>
        </div>
      </body>
    </html>
  `);


  pdfWindow.document.close();


  try {
    const pdfBlob =
      await getBlob(
        ref(
          storage,
          resource.storagePath
        )
      );


    const objectUrl =
      URL.createObjectURL(
        pdfBlob
      );


    pdfWindow.location.replace(
      objectUrl
    );


    /*
      Release temporary browser URL later.
    */
    setTimeout(
      function () {
        URL.revokeObjectURL(
          objectUrl
        );
      },

      10 *
      60 *
      1000
    );


  } catch (error) {
    pdfWindow.close();


    console.error(
      "Secure PDF could not be opened:",
      error
    );


    alert(
      "The PDF could not be opened. Check the browser Console."
    );
  }
}


/* ======================================================
   REQUEST PDF ACCESS
====================================================== */

async function requestStudentPdfAccess(
  resourceId
) {
  const user =
    auth.currentUser;


  const resource =
    studentPdfResources.find(
      function (
        item
      ) {
        return item.id ===
          resourceId;
      }
    );


  if (
    !user ||
    !resource
  ) {
    alert(
      "Please sign in again."
    );

    return;
  }


  const currentStatus =
    getStudentPdfAccessStatus(
      resourceId
    );


  if (
    currentStatus ===
    "pending"
  ) {
    alert(
      "Your access request is already pending."
    );

    return;
  }


  if (
    currentStatus ===
    "approved"
  ) {
    alert(
      "You already have access to this PDF."
    );

    return;
  }


  try {
    await addDoc(
      collection(
        db,
        "pdfRequests"
      ),

      {
        studentUid:
          user.uid,

        studentName:
          sessionStorage.getItem(
            "lmsUserName"
          )

          ||

          user.displayName

          ||

          "Student",

        studentEmail:
          user.email ||
          "",

        pdfName:
          resource.title,

        subject:
          resource.subject,

        reason:
          "Student requested access from the PDF Library.",

        status:
          "pending",

        requestType:
          "library-access",

        resourceId:
          resource.id,

        createdAt:
          serverTimestamp()
      }
    );


    alert(
      "PDF access request sent successfully."
    );


    await loadStudentPdfResources();


  } catch (error) {
    console.error(
      "PDF access request failed:",
      error
    );


    alert(
      "The PDF request could not be submitted. Check the browser Console."
    );
  }
}


/* ======================================================
   OPEN PANEL
====================================================== */

async function openFirebaseStudentPdfPanel(
  sidebarItem
) {
  document
    .querySelectorAll(
      "#student-dashboard .student-panel"
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
      "#student-dashboard .db-nav-item"
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


  document
    .getElementById(
      "student-panel-pdf-library"
    )
    ?.classList
    .add(
      "active"
    );


  sidebarItem
    ?.classList
    .add(
      "active"
    );


  await loadStudentPdfResources();


  window.scrollTo({
    top:
      0,

    behavior:
      "smooth"
  });
}


/* ======================================================
   CONNECT MODULE
====================================================== */

function connectStudentPdfLibrary() {
  if (
    studentPdfLibraryConnected
  ) {
    return;
  }


  const panelPrepared =
    prepareStudentPdfPanel();


  if (
    !panelPrepared
  ) {
    return;
  }


  ensureStudentPdfStyles();


  document
    .getElementById(
      "student-pdf-search"
    )
    .addEventListener(
      "input",
      renderStudentPdfResources
    );


  document
    .getElementById(
      "refresh-student-pdfs"
    )
    .addEventListener(
      "click",
      loadStudentPdfResources
    );


  /*
    Capture PDF Library sidebar clicks before
    the old hardcoded listener runs.
  */
  document.addEventListener(
    "click",

    function (
      event
    ) {
      const sidebarItem =
        event.target.closest(
          "#student-dashboard .db-nav-item"
        );


      if (
        !sidebarItem
      ) {
        return;
      }


      const text =
        sidebarItem
          .textContent
          .trim()
          .toLowerCase();


      if (
        !text.includes(
          "pdf library"
        )
      ) {
        return;
      }


      event.preventDefault();

      event.stopImmediatePropagation();


      openFirebaseStudentPdfPanel(
        sidebarItem
      );
    },

    true
  );


  document.addEventListener(
    "click",
    function (
      event
    ) {
      const button =
        event.target.closest(
          "[data-student-pdf-action]"
        );


      if (
        !button
      ) {
        return;
      }


      const resourceId =
        button.dataset
          .pdfId;


      const action =
        button.dataset
          .studentPdfAction;


      if (
        !resourceId
      ) {
        return;
      }


      if (
        action ===
        "open"
      ) {
        openStudentPdfResource(
          resourceId
        );

        return;
      }


      if (
        action ===
        "request"
      ) {
        requestStudentPdfAccess(
          resourceId
        );
      }
    }
  );


  studentPdfLibraryConnected =
    true;


  if (
    auth.currentUser
  ) {
    loadStudentPdfResources();
  }


  console.log(
    "Firebase student PDF library connected."
  );
}


/* ======================================================
   WAIT FOR DYNAMIC STUDENT PANEL
====================================================== */

function attemptStudentPdfSetup() {
  if (
    studentPdfLibraryConnected
  ) {
    return;
  }


  connectStudentPdfLibrary();
}


document.addEventListener(
  "DOMContentLoaded",
  attemptStudentPdfSetup
);


onAuthStateChanged(
  auth,
  function (
    user
  ) {
    if (
      user
    ) {
      attemptStudentPdfSetup();


      if (
        studentPdfLibraryConnected
      ) {
        loadStudentPdfResources();
      }
    }
  }
);


const studentPdfObserver =
  new MutationObserver(
    function () {
      attemptStudentPdfSetup();


      if (
        studentPdfLibraryConnected
      ) {
        studentPdfObserver
          .disconnect();
      }
    }
  );


studentPdfObserver.observe(
  document.documentElement,
  {
    childList:
      true,

    subtree:
      true
  }
);
