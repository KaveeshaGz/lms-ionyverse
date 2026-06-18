/* ======================================================
   BROWSE A TEACHER LMS
   STUDENT CLOUDFLARE VIDEO LIBRARY
====================================================== */

import {
  auth,
  db
} from "./firebase-config.js";


import {
  getApp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";


import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";


import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";


import {
  getFunctions,
  httpsCallable
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-functions.js";


/* ------------------------------------------------------
   FIREBASE CALLABLE FUNCTION
------------------------------------------------------ */

const functions =
  getFunctions(
    getApp(),
    "us-central1"
  );


const getStreamPlaybackToken =
  httpsCallable(
    functions,
    "getStreamPlaybackToken"
  );


/* ------------------------------------------------------
   INTERNAL STATE
------------------------------------------------------ */

let studentVideos = [];

let studentVideoAccess =
  new Map();

let studentVideoRequests =
  new Map();

let studentVideosConnected =
  false;


/* ------------------------------------------------------
   SAFE TEXT OUTPUT
------------------------------------------------------ */

function escapeStudentVideoText(
  value
) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function formatStudentVideoLkr(
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
   STUDENT VIDEO STYLES
====================================================== */

function ensureStudentVideoStyles() {
  if (
    document.getElementById(
      "student-video-library-styles"
    )
  ) {
    return;
  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "student-video-library-styles";


  style.textContent = `
    .student-video-toolbar {
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

    .student-video-toolbar-title {
      color:var(--ivory);
      font-family:var(--serif);
      font-size:22px;
    }

    .student-video-toolbar-sub {
      color:var(--ivory-dim);
      font-size:12px;
      margin-top:3px;
    }

    .student-video-toolbar-actions {
      display:flex;
      align-items:center;
      gap:10px;
      flex-wrap:wrap;
    }

    .student-video-search {
      min-width:230px;
    }

    .student-video-grid {
      display:grid;
      grid-template-columns:
        repeat(
          auto-fit,
          minmax(250px, 1fr)
        );
      gap:16px;
    }

    .student-video-card {
      display:flex;
      flex-direction:column;
      min-height:100%;
      padding:20px;
      border:1px solid var(--ivory-border);
      border-radius:var(--radius);
      background:var(--card-bg);
    }

    .student-video-card-top {
      display:flex;
      justify-content:space-between;
      align-items:flex-start;
      gap:10px;
      margin-bottom:16px;
    }

    .student-video-subject {
      color:var(--yellow);
      font-family:var(--mono);
      font-size:10px;
      letter-spacing:0.08em;
      text-transform:uppercase;
    }

    .student-video-title {
      margin-top:9px;
      color:var(--ivory);
      font-family:var(--serif);
      font-size:23px;
      line-height:1.12;
    }

    .student-video-teacher {
      margin-top:10px;
      color:var(--pastel-lilac);
      font-size:12px;
    }

    .student-video-description {
      flex:1;
      margin-top:14px;
      color:var(--ivory-dim);
      font-size:12px;
      line-height:1.75;
    }

    .student-video-meta {
      display:flex;
      justify-content:space-between;
      gap:12px;
      flex-wrap:wrap;
      margin-top:18px;
      padding-top:15px;
      border-top:1px solid var(--ivory-border);
      color:var(--ivory-dim);
      font-size:11px;
    }

    .student-video-price {
      color:var(--yellow);
      font-family:var(--mono);
    }

    .student-video-action {
      width:100%;
      margin-top:18px;
    }

    .student-video-empty {
      grid-column:1/-1;
      padding:40px 20px;
      border:1px dashed var(--ivory-border);
      border-radius:var(--radius);
      background:var(--card-bg);
      color:var(--ivory-dim);
      text-align:center;
      font-size:13px;
    }

    .student-stream-modal {
      position:fixed;
      inset:0;
      z-index:9999;
      display:none;
      align-items:center;
      justify-content:center;
      padding:20px;
      background:rgba(0,0,0,0.86);
    }

    .student-stream-modal.open {
      display:flex;
    }

    .student-stream-modal-card {
      position:relative;
      width:min(1100px, 100%);
      border:1px solid var(--ivory-border);
      border-radius:var(--radius);
      background:#0a0a0a;
      overflow:hidden;
    }

    .student-stream-modal-head {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      padding:14px 16px;
      border-bottom:1px solid var(--ivory-border);
    }

    .student-stream-modal-title {
      color:var(--ivory);
      font-size:14px;
    }

    .student-stream-close {
      border:none;
      background:transparent;
      color:var(--ivory);
      cursor:pointer;
      font-size:28px;
      line-height:1;
    }

    .student-stream-frame-wrap {
      position:relative;
      width:100%;
      padding-top:56.25%;
      background:#000;
    }

    .student-stream-frame {
      position:absolute;
      inset:0;
      width:100%;
      height:100%;
      border:0;
    }

    .student-purchase-modal {
      position:fixed;
      inset:0;
      z-index:9999;
      display:none;
      align-items:center;
      justify-content:center;
      padding:20px;
      background:rgba(0,0,0,0.82);
    }

    .student-purchase-modal.open {
      display:flex;
    }

    .student-purchase-card {
      position:relative;
      width:min(520px, 100%);
      padding:26px;
      border:1px solid var(--ivory-border);
      border-radius:var(--radius);
      background:var(--card-bg);
    }

    .student-purchase-title {
      color:var(--ivory);
      font-family:var(--serif);
      font-size:27px;
      line-height:1.12;
    }

    .student-purchase-price {
      margin-top:12px;
      color:var(--yellow);
      font-family:var(--mono);
      font-size:14px;
    }

    .student-purchase-text {
      margin-top:18px;
      color:var(--ivory-dim);
      font-size:13px;
      line-height:1.75;
    }

    @media (max-width:680px) {
      .student-video-toolbar-actions {
        width:100%;
      }

      .student-video-search {
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
   REPLACE HARDCODED VIDEO PANEL
====================================================== */

function replaceStudentVideoPanel() {
  const panel =
    document.getElementById(
      "student-panel-videos"
    );


  if (
    !panel
  ) {
    return false;
  }


  panel.innerHTML = `
    <div class="section-head">

      <div class="page-title">
        Videos
      </div>

      <div class="page-subtitle">
        Watch published Business Studies and Chemistry lessons.
      </div>

    </div>


    <div class="student-video-toolbar">

      <div>

        <div class="student-video-toolbar-title">
          Video Library
        </div>

        <div class="student-video-toolbar-sub">
          Free lessons open immediately.
          Paid lessons require approval.
        </div>

      </div>


      <div class="student-video-toolbar-actions">

        <input
          id="student-video-search"
          class="form-input student-video-search"
          type="search"
          placeholder="Search videos...">


        <button
          id="refresh-student-videos"
          class="act-btn"
          type="button">

          Refresh

        </button>

      </div>

    </div>


    <div
      id="student-video-grid"
      class="student-video-grid">

      <div class="student-video-empty">
        Loading published videos...
      </div>

    </div>
  `;


  return true;
}


/* ======================================================
   LOAD STUDENT VIDEO ACCESS
====================================================== */

async function loadCurrentStudentVideoAccess(
  studentUid
) {
  studentVideoAccess =
    new Map();


  const accessQuery =
    query(
      collection(
        db,
        "videoAccess"
      ),

      where(
        "studentUid",
        "==",
        studentUid
      )
    );


  const accessSnapshot =
    await getDocs(
      accessQuery
    );


  accessSnapshot.forEach(
    function (
      accessDocument
    ) {
      const access =
        accessDocument.data();


      studentVideoAccess.set(
        access.videoId,
        {
          id:
            accessDocument.id,

          ...access
        }
      );
    }
  );
}


/* ======================================================
   LOAD STUDENT PURCHASE REQUESTS
====================================================== */

async function loadCurrentStudentVideoRequests(
  studentUid
) {
  studentVideoRequests =
    new Map();


  const requestsQuery =
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


  const requestsSnapshot =
    await getDocs(
      requestsQuery
    );


  const requests =
    [];


  requestsSnapshot.forEach(
    function (
      requestDocument
    ) {
      requests.push({
        id:
          requestDocument.id,

        ...requestDocument.data()
      });
    }
  );


  requests.sort(
    function (
      firstRequest,
      secondRequest
    ) {
      const firstTime =
        firstRequest
          .createdAt
          ?.seconds ||
        0;


      const secondTime =
        secondRequest
          .createdAt
          ?.seconds ||
        0;


      return (
        secondTime -
        firstTime
      );
    }
  );


  requests.forEach(
    function (
      request
    ) {
      if (
        !studentVideoRequests.has(
          request.videoId
        )
      ) {
        studentVideoRequests.set(
          request.videoId,
          request
        );
      }
    }
  );
}


/* ======================================================
   LOAD PUBLISHED FIRESTORE VIDEOS
====================================================== */

async function loadStudentVideos() {
  const user =
    auth.currentUser;


  const grid =
    document.getElementById(
      "student-video-grid"
    );


  if (
    !user ||
    !grid
  ) {
    return;
  }


  grid.innerHTML = `
    <div class="student-video-empty">
      Loading published videos...
    </div>
  `;


  try {
    /*
      Query only published videos.

      Firestore Rules are not filters.
      Students must not request hidden videos.
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


    const [
      videosSnapshot
    ] =
      await Promise.all([
        getDocs(
          videosQuery
        ),

        loadCurrentStudentVideoAccess(
          user.uid
        ),

        loadCurrentStudentVideoRequests(
          user.uid
        )
      ]);


    studentVideos =
      videosSnapshot.docs.map(
        function (
          videoDocument
        ) {
          return {
            id:
              videoDocument.id,

            ...videoDocument.data()
          };
        }
      );


    studentVideos.sort(
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


    renderStudentVideos();


  } catch (error) {
    console.error(
      "Student videos could not be loaded:",
      error
    );


    grid.innerHTML = `
      <div class="student-video-empty">
        Videos could not be loaded.
        Check the browser Console.
      </div>
    `;
  }
}


/* ======================================================
   DETERMINE BUTTON STATE
====================================================== */

function createStudentVideoAction(
  video
) {
  if (
    video.streamState !==
    "ready"
  ) {
    return `
      <button
        class="btn-large btn-outline student-video-action"
        type="button"
        disabled>

        Processing

      </button>
    `;
  }


  if (
    video.accessType ===
    "free"
  ) {
    return `
      <button
        class="btn-large btn-yellow student-video-action"
        type="button"
        data-student-video-action="watch"
        data-video-id="${escapeStudentVideoText(
          video.id
        )}">

        Watch Video

      </button>
    `;
  }


  const access =
    studentVideoAccess.get(
      video.id
    );


  if (
    access?.active ===
    true
  ) {
    return `
      <button
        class="btn-large btn-yellow student-video-action"
        type="button"
        data-student-video-action="watch"
        data-video-id="${escapeStudentVideoText(
          video.id
        )}">

        Watch Video

      </button>
    `;
  }


  const request =
    studentVideoRequests.get(
      video.id
    );


  if (
    request?.status ===
    "pending"
  ) {
    return `
      <button
        class="btn-large btn-outline student-video-action"
        type="button"
        disabled>

        Pending Approval

      </button>
    `;
  }


  if (
    request?.status ===
    "approved"
  ) {
    return `
      <button
        class="btn-large btn-outline student-video-action"
        type="button"
        disabled>

        Approval Syncing

      </button>
    `;
  }


  return `
    <button
      class="btn-large btn-outline student-video-action"
      type="button"
      data-student-video-action="buy"
      data-video-id="${escapeStudentVideoText(
        video.id
      )}">

      ${
        request?.status ===
        "rejected"
          ? "Upload New Slip"
          : "Buy Access"
      }

    </button>
  `;
}


/* ======================================================
   RENDER STUDENT VIDEOS
====================================================== */

function renderStudentVideos() {
  const grid =
    document.getElementById(
      "student-video-grid"
    );


  const searchInput =
    document.getElementById(
      "student-video-search"
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


  const visibleVideos =
    studentVideos.filter(
      function (
        video
      ) {
        const combinedText =
          [
            video.title,
            video.subject,
            video.teacher,
            video.description,
            video.accessType
          ]
            .join(" ")
            .toLowerCase();


        return combinedText.includes(
          searchText
        );
      }
    );


  if (
    visibleVideos.length ===
    0
  ) {
    grid.innerHTML = `
      <div class="student-video-empty">

        <div style="
          font-size:30px;
          margin-bottom:8px;
        ">
          ðŸŽ¬
        </div>

        No published videos are available yet.

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


          return `
            <article class="student-video-card">

              <div class="student-video-card-top">

                <div>

                  <div class="student-video-subject">
                    ${escapeStudentVideoText(
                      video.subject
                    )}
                  </div>

                  <div class="student-video-title">
                    ${escapeStudentVideoText(
                      video.title
                    )}
                  </div>

                </div>


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
                      ? "Paid"
                      : "Free"
                  }

                </span>

              </div>


              <div class="student-video-teacher">
                ${escapeStudentVideoText(
                  video.teacher
                )}
              </div>


              <p class="student-video-description">
                ${escapeStudentVideoText(
                  video.description
                )}
              </p>


              <div class="student-video-meta">

                <span>
                  ${
                    video.streamState ===
                    "ready"
                      ? "Ready to watch"
                      : "Processing"
                  }
                </span>

                <span class="student-video-price">
                  ${formatStudentVideoLkr(
                    video.priceLkr
                  )}
                </span>

              </div>


              ${createStudentVideoAction(
                video
              )}

            </article>
          `;
        }
      )
      .join("");
}


/* ======================================================
   SECURE CLOUDFLARE PLAYER MODAL
====================================================== */

function createStudentStreamModal() {
  if (
    document.getElementById(
      "student-stream-modal"
    )
  ) {
    return;
  }


  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div
        id="student-stream-modal"
        class="student-stream-modal">

        <div class="student-stream-modal-card">

          <div class="student-stream-modal-head">

            <div
              id="student-stream-modal-title"
              class="student-stream-modal-title">

              Secure Video Player

            </div>


            <button
              class="student-stream-close"
              type="button"
              data-student-video-action="close-player">

              Ã—

            </button>

          </div>


          <div class="student-stream-frame-wrap">

            <iframe
              id="student-stream-frame"
              class="student-stream-frame"
              src=""
              allow="
                accelerometer;
                gyroscope;
                autoplay;
                encrypted-media;
                picture-in-picture;
              "
              allowfullscreen>
            </iframe>

          </div>

        </div>

      </div>
    `
  );


  document
    .getElementById(
      "student-stream-modal"
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
          closeStudentStreamPlayer();
        }
      }
    );
}


async function openStudentStreamPlayer(
  videoId
) {
  const video =
    studentVideos.find(
      function (
        item
      ) {
        return item.id ===
          videoId;
      }
    );


  if (
    !video
  ) {
    alert(
      "The selected video could not be found."
    );

    return;
  }


  try {
    const result =
      await getStreamPlaybackToken({
        videoId:
          videoId
      });


    const iframeUrl =
      result.data?.iframeUrl;


    if (
      !iframeUrl
    ) {
      throw new Error(
        "The secure player URL is missing."
      );
    }


    const modal =
      document.getElementById(
        "student-stream-modal"
      );


    const title =
      document.getElementById(
        "student-stream-modal-title"
      );


    const frame =
      document.getElementById(
        "student-stream-frame"
      );


    title.textContent =
      video.title;


    frame.src =
      iframeUrl;


    modal.classList.add(
      "open"
    );


    document.body.style.overflow =
      "hidden";


   } catch (error) {
    console.error(
      "Protected Cloudflare video could not be opened:",
      error
    );


    const errorCode =
      error?.code ||
      "unknown-error";


    const errorMessage =
      error?.message ||
      "No detailed error message was returned.";


    alert(
      "Secure playback failed.\n\n" +
      "Code: " +
      errorCode +
      "\n\n" +
      "Message: " +
      errorMessage
    );
  }
}


function closeStudentStreamPlayer() {
  const modal =
    document.getElementById(
      "student-stream-modal"
    );


  const frame =
    document.getElementById(
      "student-stream-frame"
    );


  if (
    frame
  ) {
    frame.src =
      "";
  }


  if (
    modal
  ) {
    modal.classList.remove(
      "open"
    );
  }


  document.body.style.overflow =
    "";
}


/* ======================================================
   TEMPORARY PURCHASE POPUP
====================================================== */

function createStudentPurchaseModal() {
  if (
    document.getElementById(
      "student-purchase-modal"
    )
  ) {
    return;
  }


  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div
        id="student-purchase-modal"
        class="student-purchase-modal">

        <div class="student-purchase-card">

          <button
            class="student-stream-close"
            type="button"
            data-student-video-action="close-purchase"
            style="
              position:absolute;
              top:14px;
              right:16px;
            ">

            Ã—

          </button>


          <div class="section-label">
            Paid Video Access âœ¦
          </div>


          <div
            id="student-purchase-title"
            class="student-purchase-title">
          </div>


          <div
            id="student-purchase-price"
            class="student-purchase-price">
          </div>


          <div class="student-purchase-text">

            Bank-transfer details and payment-slip
            submission will appear here after
            Payment Settings are connected in
            the next phase.

          </div>

        </div>

      </div>
    `
  );


  document
    .getElementById(
      "student-purchase-modal"
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
          closeStudentPurchaseModal();
        }
      }
    );
}


function openStudentPurchaseModal(
  videoId
) {
  const video =
    studentVideos.find(
      function (
        item
      ) {
        return item.id ===
          videoId;
      }
    );


  if (
    !video
  ) {
    alert(
      "The selected video could not be found."
    );

    return;
  }


  document
    .getElementById(
      "student-purchase-title"
    )
    .textContent =
      video.title;


  document
    .getElementById(
      "student-purchase-price"
    )
    .textContent =
      formatStudentVideoLkr(
        video.priceLkr
      );


  document
    .getElementById(
      "student-purchase-modal"
    )
    .classList.add(
      "open"
    );


  document.body.style.overflow =
    "hidden";
}


function closeStudentPurchaseModal() {
  const modal =
    document.getElementById(
      "student-purchase-modal"
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
}


/* ======================================================
   CONNECT VIDEO PAGE
====================================================== */

function connectStudentVideoLibrary() {
  if (
    studentVideosConnected
  ) {
    return;
  }


  const panelExists =
    replaceStudentVideoPanel();


  if (
    !panelExists
  ) {
    return;
  }


  ensureStudentVideoStyles();

  createStudentStreamModal();

  createStudentPurchaseModal();


  document
    .getElementById(
      "student-video-search"
    )
    .addEventListener(
      "input",
      renderStudentVideos
    );


  document
    .getElementById(
      "refresh-student-videos"
    )
    .addEventListener(
      "click",
      loadStudentVideos
    );


  document.addEventListener(
    "click",
    function (
      event
    ) {
      const button =
        event.target.closest(
          "[data-student-video-action]"
        );


      if (
        !button
      ) {
        return;
      }


      const action =
        button.dataset
          .studentVideoAction;


      const videoId =
        button.dataset
          .videoId;


      if (
        action === "watch" &&
        videoId
      ) {
        openStudentStreamPlayer(
          videoId
        );

        return;
      }


      if (
        action === "buy" &&
        videoId
      ) {
        openStudentPurchaseModal(
          videoId
        );

        return;
      }


      if (
        action ===
        "close-player"
      ) {
        closeStudentStreamPlayer();

        return;
      }


      if (
        action ===
        "close-purchase"
      ) {
        closeStudentPurchaseModal();
      }
    }
  );


  /*
    Reload videos whenever the student opens
    the Videos sidebar page.
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
        text.includes(
          "videos"
        )
      ) {
        loadStudentVideos();
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
        closeStudentStreamPlayer();

        closeStudentPurchaseModal();
      }
    }
  );


  studentVideosConnected =
    true;


  loadStudentVideos();


  console.log(
    "Firebase student video library connected."
  );
}


/* ======================================================
   WAIT FOR STUDENT.JS TO CREATE DYNAMIC PANELS
====================================================== */

function attemptStudentVideoLibrarySetup() {
  if (
    studentVideosConnected
  ) {
    return;
  }


  connectStudentVideoLibrary();
}


document.addEventListener(
  "DOMContentLoaded",
  attemptStudentVideoLibrarySetup
);


onAuthStateChanged(
  auth,
  function (
    user
  ) {
    if (
      user
    ) {
      attemptStudentVideoLibrarySetup();


      if (
        studentVideosConnected
      ) {
        loadStudentVideos();
      }
    }
  }
);


const studentVideoObserver =
  new MutationObserver(
    function () {
      attemptStudentVideoLibrarySetup();


      if (
        studentVideosConnected
      ) {
        studentVideoObserver
          .disconnect();
      }
    }
  );


studentVideoObserver.observe(
  document.documentElement,
  {
    childList:
      true,

    subtree:
      true
  }
);

window.reloadStudentVideos =
  loadStudentVideos;
