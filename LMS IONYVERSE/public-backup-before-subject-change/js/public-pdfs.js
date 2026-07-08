/* ======================================================
   BROWSE A TEACHER LMS
   PUBLIC FIRESTORE PDF COURSE LIBRARY
====================================================== */

import {
  db
} from "./firebase-config.js";


import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";


let publicPdfResources =
  [];


let selectedPublicPdfSubject =
  "all";


/* ------------------------------------------------------
   SAFE OUTPUT
------------------------------------------------------ */

function escapePublicPdfText(
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

function ensurePublicPdfStyles() {
  if (
    document.getElementById(
      "public-firestore-pdf-styles"
    )
  ) {
    return;
  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "public-firestore-pdf-styles";


  style.textContent = `
    .public-pdf-info {
      display:flex;
      align-items:center;
      gap:12px;
      flex-wrap:wrap;
      margin-bottom:22px;
      padding:14px 18px;
      border:1px solid var(--ivory-border);
      border-radius:var(--radius-sm);
      background:rgba(240,234,214,0.04);
      color:var(--ivory-dim);
      font-size:12px;
      line-height:1.7;
    }

    .public-pdf-filter-row {
      display:flex;
      gap:10px;
      flex-wrap:wrap;
      margin-bottom:24px;
    }

    .public-pdf-filter.active {
      border-color:var(--yellow);
      color:var(--yellow);
      background:rgba(255,212,0,0.04);
    }

    .public-pdf-card .course-thumb {
      background:
        radial-gradient(
          circle at top right,
          rgba(212,187,255,0.18),
          transparent 48%
        ),
        #101010;
    }

    .public-pdf-card .course-thumb-inner {
      color:var(--pastel-lilac);
      font-size:48px;
    }

    .public-pdf-access-text {
      min-height:44px;
      margin-top:14px;
      color:var(--ivory-dim);
      font-size:12px;
      line-height:1.7;
    }

    .public-pdf-bottom {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      flex-wrap:wrap;
      margin-top:16px;
      padding-top:14px;
      border-top:1px solid var(--ivory-border);
    }

    .public-pdf-empty {
      grid-column:1/-1;
      padding:36px 20px;
      border:1px dashed var(--ivory-border);
      border-radius:var(--radius);
      color:var(--ivory-dim);
      text-align:center;
      font-size:13px;
    }
  `;


  document.head.appendChild(
    style
  );
}


/* ======================================================
   REPLACE HARDCODED PUBLIC PDF AREA
====================================================== */

function preparePublicPdfLibrary() {
  const section =
    document.getElementById(
      "lib-pdfs"
    );


  if (
    !section
  ) {
    console.error(
      "Public PDF Resources section was not found."
    );

    return null;
  }


  section.innerHTML = `
    <div class="public-pdf-info">

      <span class="badge badge-yellow">
        PDF Resources
      </span>

      Browse teacher-uploaded Business Studies and
      Chemistry study materials. Log in to open
      available PDFs or request access.

    </div>


    <div class="public-pdf-filter-row">

      <button
        class="btn-ghost public-pdf-filter active"
        type="button"
        data-public-pdf-subject="all">

        ✦ All PDFs

      </button>


      <button
        class="btn-ghost public-pdf-filter"
        type="button"
        data-public-pdf-subject="Business Studies">

        📊 Business Studies

      </button>


      <button
        class="btn-ghost public-pdf-filter"
        type="button"
        data-public-pdf-subject="Chemistry">

        ⚗ Chemistry

      </button>

    </div>


    <div
      id="public-pdf-grid"
      class="courses-grid">

      <div class="public-pdf-empty">
        Loading PDF resources...
      </div>

    </div>
  `;


  return document.getElementById(
    "public-pdf-grid"
  );
}


/* ======================================================
   LOAD ACTIVE PDF METADATA
====================================================== */

async function loadPublicPdfResources() {
  const grid =
    document.getElementById(
      "public-pdf-grid"
    );


  if (
    !grid
  ) {
    return;
  }


  grid.innerHTML = `
    <div class="public-pdf-empty">
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


    const snapshot =
      await getDocs(
        resourcesQuery
      );


    publicPdfResources =
      snapshot.docs
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


    publicPdfResources.sort(
      function (
        firstResource,
        secondResource
      ) {
        const firstTime =
          firstResource
            .createdAt
            ?.seconds ||
          0;


        const secondTime =
          secondResource
            .createdAt
            ?.seconds ||
          0;


        return (
          secondTime -
          firstTime
        );
      }
    );


    renderPublicPdfResources();


  } catch (error) {
    console.error(
      "Public PDF resources could not be loaded:",
      error
    );


    grid.innerHTML = `
      <div class="public-pdf-empty">
        PDF resources could not be loaded.
        Check the browser Console.
      </div>
    `;
  }
}


/* ======================================================
   RENDER PUBLIC PDF CARDS
====================================================== */

function renderPublicPdfResources() {
  const grid =
    document.getElementById(
      "public-pdf-grid"
    );


  if (
    !grid
  ) {
    return;
  }


  const visibleResources =
    publicPdfResources.filter(
      function (
        resource
      ) {
        return (
          selectedPublicPdfSubject ===
            "all"

          ||

          resource.subject ===
            selectedPublicPdfSubject
        );
      }
    );


  if (
    visibleResources.length ===
    0
  ) {
    grid.innerHTML = `
      <div class="public-pdf-empty">

        <div style="
          font-size:30px;
          margin-bottom:8px;
        ">
          📄
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
            <article class="course-card public-pdf-card">

              <div class="course-thumb">

                <div class="course-thumb-inner">
                  📄
                </div>


                <span class="course-badge">
                  PDF
                </span>

              </div>


              <div class="course-body">

                <div class="course-subject">
                  ${escapePublicPdfText(
                    resource.subject
                  )}
                </div>


                <div class="course-title">
                  ${escapePublicPdfText(
                    resource.title
                  )}
                </div>


                <div class="course-teacher">
                  ${escapePublicPdfText(
                    resource.teacher
                  )}
                </div>


                <div class="public-pdf-access-text">

                  ${
                    requiresApproval
                      ? "Administrator approval is required before opening this PDF."
                      : "Available immediately after signing in."
                  }

                </div>


                <div class="public-pdf-bottom">

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
                        : "Open Access"
                    }

                  </span>

                </div>


                <button
                  class="btn-primary"
                  type="button"
                  data-public-pdf-login
                  style="
                    width:100%;
                    margin-top:16px;
                    padding:10px;
                  ">

                  ${
                    requiresApproval
                      ? "Login to Request Access"
                      : "Login to Open PDF"
                  }

                </button>

              </div>

            </article>
          `;
        }
      )
      .join("");
}


/* ======================================================
   CONNECT PUBLIC PDF LIBRARY
====================================================== */

function connectPublicPdfLibrary() {
  ensurePublicPdfStyles();


  const grid =
    preparePublicPdfLibrary();


  if (
    !grid
  ) {
    return;
  }


  document.addEventListener(
    "click",
    function (
      event
    ) {
      const filterButton =
        event.target.closest(
          "[data-public-pdf-subject]"
        );


      if (
        filterButton
      ) {
        selectedPublicPdfSubject =
          filterButton.dataset
            .publicPdfSubject;


        document
          .querySelectorAll(
            "[data-public-pdf-subject]"
          )
          .forEach(
            function (
              button
            ) {
              button.classList.remove(
                "active"
              );
            }
          );


        filterButton.classList.add(
          "active"
        );


        renderPublicPdfResources();


        return;
      }


      const loginButton =
        event.target.closest(
          "[data-public-pdf-login]"
        );


      if (
        loginButton
      ) {
        window.location.href =
          "./login.html";
      }
    }
  );


  loadPublicPdfResources();


  console.log(
    "Public Firestore PDF library connected."
  );
}


/* ======================================================
   START
====================================================== */

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    connectPublicPdfLibrary
  );

} else {
  connectPublicPdfLibrary();
}