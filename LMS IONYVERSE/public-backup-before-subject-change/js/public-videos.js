/* ======================================================
   BROWSE A TEACHER LMS
   PUBLIC FIRESTORE VIDEO COURSE LIBRARY
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


/* ------------------------------------------------------
   INTERNAL STATE
------------------------------------------------------ */

let publicVideos =
  [];


let selectedPublicVideoSubject =
  "all";


/* ------------------------------------------------------
   SAFE OUTPUT
------------------------------------------------------ */

function escapePublicVideoText(
  value
) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function formatPublicVideoLkr(
  value
) {
  const amount =
    Number(value || 0);


  if (
    amount === 0
  ) {
    return "Free";
  }


  return (
    "LKR " +
    amount.toLocaleString(
      "en-LK"
    )
  );
}


/* ======================================================
   PUBLIC VIDEO STYLES
====================================================== */

function ensurePublicVideoStyles() {
  if (
    document.getElementById(
      "public-firestore-video-styles"
    )
  ) {
    return;
  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "public-firestore-video-styles";


  style.textContent = `
    .public-video-info {
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

    .public-video-filter-row {
      display:flex;
      gap:10px;
      flex-wrap:wrap;
      margin-bottom:24px;
    }

    .public-video-filter.active {
      border-color:var(--yellow);
      color:var(--yellow);
      background:rgba(255,212,0,0.04);
    }

    .public-video-card {
      cursor:default;
    }

    .public-video-card .course-thumb {
      background:
        radial-gradient(
          circle at top right,
          rgba(255,212,0,0.12),
          transparent 45%
        ),
        #101010;
    }

    .public-video-card .course-thumb-inner {
      color:var(--yellow);
      font-size:48px;
    }

    .public-video-description {
      min-height:48px;
      margin-top:12px;
      color:var(--ivory-dim);
      font-size:12px;
      line-height:1.7;
    }

    .public-video-bottom {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      margin-top:16px;
      padding-top:14px;
      border-top:1px solid var(--ivory-border);
    }

    .public-video-access {
      font-family:var(--mono);
      font-size:11px;
      color:var(--yellow);
    }

    .public-video-empty {
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
   REPLACE OLD HARDCODED VIDEO AREA
====================================================== */

function ensurePublicVideoLibrary() {
  const videoSection =
    document.getElementById(
      "lib-videos"
    );


  if (
    !videoSection
  ) {
    console.error(
      "Public Course Library video section was not found."
    );

    return null;
  }


  videoSection.innerHTML = `
    <div class="public-video-info">

      <span class="badge badge-yellow">
        Video Courses
      </span>

      Browse published Business Studies and Chemistry
      video lessons. Log in to watch free lessons
      or request access to paid lessons.

    </div>


    <div class="public-video-filter-row">

      <button
        class="btn-ghost public-video-filter active"
        type="button"
        data-public-video-subject="all">

        ✦ All Videos

      </button>


      <button
        class="btn-ghost public-video-filter"
        type="button"
        data-public-video-subject="Business Studies">

        📊 Business Studies

      </button>


      <button
        class="btn-ghost public-video-filter"
        type="button"
        data-public-video-subject="Chemistry">

        ⚗ Chemistry

      </button>

    </div>


    <div
      id="public-video-grid"
      class="courses-grid">

      <div class="public-video-empty">
        Loading published video courses...
      </div>

    </div>
  `;


  return document.getElementById(
    "public-video-grid"
  );
}


/* ======================================================
   LOAD PUBLISHED FIRESTORE VIDEOS
====================================================== */

async function loadPublicVideos() {
  const grid =
    document.getElementById(
      "public-video-grid"
    );


  if (
    !grid
  ) {
    return;
  }


  grid.innerHTML = `
    <div class="public-video-empty">
      Loading published video courses...
    </div>
  `;


  try {
    /*
      Firestore Rules are not filters.

      Request published videos explicitly so public
      visitors never request hidden documents.
    */
    const videosQuery =
      query(
        collection(
          db,
          "videos"
        ),

        where(
          "status",
          "==",
          "published"
        )
      );


    const snapshot =
      await getDocs(
        videosQuery
      );


    publicVideos =
      snapshot.docs
        .map(
          function (
            videoDocument
          ) {
            return {
              id:
                videoDocument.id,

              ...videoDocument.data()
            };
          }
        )
        .filter(
          function (
            video
          ) {
            return (
              video.streamState ===
                "ready"

              &&

              (
                video.subject ===
                  "Business Studies"

                ||

                video.subject ===
                  "Chemistry"
              )
            );
          }
        );


    publicVideos.sort(
      function (
        firstVideo,
        secondVideo
      ) {
        const firstTime =
          firstVideo
            .createdAt
            ?.seconds ||
          0;


        const secondTime =
          secondVideo
            .createdAt
            ?.seconds ||
          0;


        return (
          secondTime -
          firstTime
        );
      }
    );


    renderPublicVideos();


  } catch (error) {
    console.error(
      "Public video courses could not be loaded:",
      error
    );


    grid.innerHTML = `
      <div class="public-video-empty">
        Video courses could not be loaded.
        Check the browser Console.
      </div>
    `;
  }
}


/* ======================================================
   RENDER COURSE CARDS
====================================================== */

function renderPublicVideos() {
  const grid =
    document.getElementById(
      "public-video-grid"
    );


  if (
    !grid
  ) {
    return;
  }


  const visibleVideos =
    publicVideos.filter(
      function (
        video
      ) {
        return (
          selectedPublicVideoSubject ===
            "all"

          ||

          video.subject ===
            selectedPublicVideoSubject
        );
      }
    );


  if (
    visibleVideos.length ===
    0
  ) {
    grid.innerHTML = `
      <div class="public-video-empty">

        <div style="
          font-size:30px;
          margin-bottom:8px;
        ">
          🎬
        </div>

        No published video courses are available yet.

      </div>
    `;


    return;
  }


  grid.innerHTML =
    visibleVideos
      .map(
        function (
          video
        ) {
          const isPaid =
            video.accessType ===
            "paid";


          const buttonText =
            isPaid
              ? "Login to Buy Access"
              : "Login to Watch";


          return `
            <article class="course-card public-video-card">

              <div class="course-thumb">

                <div class="course-thumb-inner">
                  🎬
                </div>


                <span class="course-badge">

                  ${
                    isPaid
                      ? "PAID"
                      : "FREE"
                  }

                </span>

              </div>


              <div class="course-body">

                <div class="course-subject">
                  ${escapePublicVideoText(
                    video.subject
                  )}
                </div>


                <div class="course-title">
                  ${escapePublicVideoText(
                    video.title
                  )}
                </div>


                <div class="course-teacher">
                  ${escapePublicVideoText(
                    video.teacher
                  )}
                </div>


                <div class="public-video-description">
                  ${escapePublicVideoText(
                    video.description
                  )}
                </div>


                <div class="public-video-bottom">

                  <span class="public-video-access">
                    ${formatPublicVideoLkr(
                      video.priceLkr
                    )}
                  </span>


                  <span class="
                    badge
                    ${
                      isPaid
                        ? "badge-yellow"
                        : "badge-green"
                    }
                  ">

                    ${
                      isPaid
                        ? "Approval Required"
                        : "Free Lesson"
                    }

                  </span>

                </div>


                <button
                  class="btn-primary"
                  type="button"
                  data-public-video-login
                  style="
                    width:100%;
                    margin-top:16px;
                    padding:10px;
                  ">

                  ${buttonText}

                </button>

              </div>

            </article>
          `;
        }
      )
      .join("");
}


/* ======================================================
   CONNECT PUBLIC VIDEO LIBRARY
====================================================== */

function connectPublicVideoLibrary() {
  ensurePublicVideoStyles();


  const grid =
    ensurePublicVideoLibrary();


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
          "[data-public-video-subject]"
        );


      if (
        filterButton
      ) {
        selectedPublicVideoSubject =
          filterButton.dataset
            .publicVideoSubject;


        document
          .querySelectorAll(
            "[data-public-video-subject]"
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


        renderPublicVideos();


        return;
      }


      const loginButton =
        event.target.closest(
          "[data-public-video-login]"
        );


      if (
        loginButton
      ) {
        window.location.href =
          "./login.html";
      }
    }
  );


  loadPublicVideos();


  console.log(
    "Public Firestore video library connected."
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
    connectPublicVideoLibrary
  );

} else {
  connectPublicVideoLibrary();
}