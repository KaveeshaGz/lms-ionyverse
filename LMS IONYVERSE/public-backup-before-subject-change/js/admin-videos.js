/* ======================================================
   BROWSE A TEACHER LMS
   ADMIN CLOUDFLARE VIDEO MANAGER
====================================================== */

import {
  auth,
  db
} from "./firebase-config.js";


import {
  getApp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";


import {
  getFunctions,
  httpsCallable
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-functions.js";


import {
  collection,
  doc,
  getDocs,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";


/* ------------------------------------------------------
   FIREBASE CALLABLE FUNCTIONS
------------------------------------------------------ */

const functions =
  getFunctions(
    getApp(),
    "us-central1"
  );


const createStreamDirectUpload =
  httpsCallable(
    functions,
    "createStreamDirectUpload"
  );


const syncStreamVideoStatus =
  httpsCallable(
    functions,
    "syncStreamVideoStatus"
  );


const deleteStreamVideo =
  httpsCallable(
    functions,
    "deleteStreamVideo"
  );


/* ------------------------------------------------------
   INTERNAL STATE
------------------------------------------------------ */

let adminVideos = [];

let adminVideoManagerConnected =
  false;


/* ------------------------------------------------------
   SAFE OUTPUT
------------------------------------------------------ */

function escapeAdminVideoText(
  value
) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function formatLkr(
  value
) {
  const amount =
    Number(value || 0);


  return (
    "LKR " +
    amount.toLocaleString(
      "en-LK"
    )
  );
}


/* ======================================================
   REPLACE OLD VISUAL-TEST VIDEO FORM
====================================================== */

function replaceOldVideoUploadForm() {
  const oldForm =
    document.getElementById(
      "admin-video-upload-form"
    );


  if (!oldForm) {
    return null;
  }


  /*
    Clone the form shell.

    This removes the old temporary visual-testing
    submit listener already attached by admin.js.
  */
  const newForm =
    oldForm.cloneNode(false);


  newForm.innerHTML = `
    <div class="db-recent">
      Upload New Cloudflare Stream Video
    </div>


    <div class="form-grid">

      <div class="form-group">
        <label class="form-label">
          Video Title
        </label>

        <input
          id="video-title"
          class="form-input"
          type="text"
          placeholder="Example: Business Studies Fundamentals — Part 01"
          maxlength="160"
          required>
      </div>


      <div class="form-group">
        <label class="form-label">
          Subject
        </label>

        <select
          id="video-subject"
          class="form-select form-input"
          required>

          <option value="Business Studies">
            Business Studies
          </option>

          <option value="Chemistry">
            Chemistry
          </option>

        </select>
      </div>


      <div class="form-group">
        <label class="form-label">
          Teacher
        </label>

        <input
          id="video-teacher"
          class="form-input"
          type="text"
          placeholder="Example: Mr. R. Perera"
          maxlength="120"
          required>
      </div>


      <div class="form-group">
        <label class="form-label">
          Access Type
        </label>

        <select
          id="video-access-type"
          class="form-select form-input"
          required>

          <option value="free">
            Free — Available to approved students
          </option>

          <option value="paid">
            Paid — Bank-slip approval required
          </option>

        </select>
      </div>


      <div class="form-group">
        <label class="form-label">
          Price in LKR
        </label>

        <input
          id="video-price-lkr"
          class="form-input"
          type="number"
          min="0"
          step="1"
          value="0"
          required>
      </div>


      <div class="form-group">
        <label class="form-label">
          Maximum Duration in Minutes
        </label>

        <input
          id="video-max-duration-minutes"
          class="form-input"
          type="number"
          min="1"
          max="600"
          step="1"
          value="120"
          required>
      </div>

    </div>


    <div
      class="form-group"
      style="margin-bottom:20px">

      <label class="form-label">
        Choose Video File
      </label>

      <input
        id="video-file"
        class="admin-file-input"
        type="file"
        accept="video/*"
        required>

      <div class="admin-video-input-note">
        Current upload limit: below 200 MB.
        Larger resumable uploads will be enabled later.
      </div>

    </div>


    <div
      class="form-group"
      style="margin-bottom:20px">

      <label class="form-label">
        Description
      </label>

      <textarea
        id="video-description"
        class="form-input"
        rows="5"
        maxlength="1500"
        placeholder="Enter a short lesson description"
        style="resize:vertical"
        required>
      </textarea>

    </div>


    <div
      id="admin-video-upload-progress"
      class="admin-video-progress-wrap"
      hidden>

      <div class="admin-video-progress-track">

        <div
          id="admin-video-upload-progress-bar"
          class="admin-video-progress-bar">
        </div>

      </div>

      <div
        id="admin-video-upload-message"
        class="admin-video-progress-message">

        Preparing upload...

      </div>

    </div>


    <button
      id="admin-video-upload-submit"
      type="submit"
      class="btn-large btn-yellow">

      Upload Video

    </button>
  `;


  oldForm.replaceWith(
    newForm
  );


  return newForm;
}


/* ======================================================
   VIDEO PRICE FIELD
====================================================== */

function synchronizeVideoPriceField() {
  const accessInput =
    document.getElementById(
      "video-access-type"
    );


  const priceInput =
    document.getElementById(
      "video-price-lkr"
    );


  if (
    !accessInput ||
    !priceInput
  ) {
    return;
  }


  const isFree =
    accessInput.value ===
    "free";


  priceInput.disabled =
    isFree;


  if (
    isFree
  ) {
    priceInput.value =
      "0";
  }
}


/* ======================================================
   VIDEO UPLOAD PROGRESS
====================================================== */

function updateAdminVideoProgress(
  percent,
  message
) {
  const progressWrap =
    document.getElementById(
      "admin-video-upload-progress"
    );


  const progressBar =
    document.getElementById(
      "admin-video-upload-progress-bar"
    );


  const progressMessage =
    document.getElementById(
      "admin-video-upload-message"
    );


  if (
    progressWrap
  ) {
    progressWrap.hidden =
      false;
  }


  if (
    progressBar
  ) {
    progressBar.style.width =
      Math.max(
        0,
        Math.min(
          100,
          Number(percent || 0)
        )
      ) +
      "%";
  }


  if (
    progressMessage
  ) {
    progressMessage.textContent =
      message;
  }
}


function resetAdminVideoProgress() {
  const progressWrap =
    document.getElementById(
      "admin-video-upload-progress"
    );


  const progressBar =
    document.getElementById(
      "admin-video-upload-progress-bar"
    );


  const progressMessage =
    document.getElementById(
      "admin-video-upload-message"
    );


  if (
    progressWrap
  ) {
    progressWrap.hidden =
      true;
  }


  if (
    progressBar
  ) {
    progressBar.style.width =
      "0%";
  }


  if (
    progressMessage
  ) {
    progressMessage.textContent =
      "Preparing upload...";
  }
}


/* ======================================================
   UPLOAD FILE DIRECTLY TO CLOUDFLARE
====================================================== */

function uploadFileToCloudflare(
  uploadURL,
  videoFile
) {
  return new Promise(
    function (
      resolve,
      reject
    ) {
      const request =
        new XMLHttpRequest();


      const formData =
        new FormData();


      formData.append(
        "file",
        videoFile
      );


      request.open(
        "POST",
        uploadURL,
        true
      );


      request.upload.addEventListener(
        "progress",
        function (
          event
        ) {
          if (
            !event.lengthComputable
          ) {
            return;
          }


          const percent =
            Math.round(
              (
                event.loaded /
                event.total
              ) *
              100
            );


          updateAdminVideoProgress(
            percent,
            "Uploading video: " +
            percent +
            "%"
          );
        }
      );


      request.addEventListener(
        "load",
        function () {
          if (
            request.status >= 200 &&
            request.status < 300
          ) {
            resolve();

            return;
          }


          reject(
            new Error(
              "Cloudflare upload failed with status " +
              request.status +
              "."
            )
          );
        }
      );


      request.addEventListener(
        "error",
        function () {
          reject(
            new Error(
              "The video upload connection failed."
            )
          );
        }
      );


      request.addEventListener(
        "abort",
        function () {
          reject(
            new Error(
              "The video upload was cancelled."
            )
          );
        }
      );


      request.send(
        formData
      );
    }
  );
}


/* ======================================================
   HANDLE ADMIN VIDEO UPLOAD
====================================================== */

async function uploadAdminCloudflareVideo(
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

    window.location.href =
      "./login.html";

    return;
  }


  const form =
    event.currentTarget;


  const submitButton =
    document.getElementById(
      "admin-video-upload-submit"
    );


  const title =
    document
      .getElementById(
        "video-title"
      )
      .value
      .trim();


  const subject =
    document
      .getElementById(
        "video-subject"
      )
      .value;


  const teacher =
    document
      .getElementById(
        "video-teacher"
      )
      .value
      .trim();


  const accessType =
    document
      .getElementById(
        "video-access-type"
      )
      .value;


  const priceLkr =
    Number(
      document
        .getElementById(
          "video-price-lkr"
        )
        .value
    );


  const maxDurationMinutes =
    Number(
      document
        .getElementById(
          "video-max-duration-minutes"
        )
        .value
    );


  const description =
    document
      .getElementById(
        "video-description"
      )
      .value
      .trim();


  const videoFile =
    document
      .getElementById(
        "video-file"
      )
      .files[0];


  if (
    !title ||
    !teacher ||
    !description ||
    !videoFile
  ) {
    alert(
      "Please complete every required video field."
    );

    return;
  }


  if (
    subject !== "Business Studies" &&
    subject !== "Chemistry"
  ) {
    alert(
      "Please select Business Studies or Chemistry."
    );

    return;
  }


  if (
    accessType === "paid" &&
    (
      !Number.isFinite(
        priceLkr
      ) ||
      priceLkr <= 0
    )
  ) {
    alert(
      "Paid videos must have a valid price above zero."
    );

    return;
  }


  if (
    accessType === "free" &&
    priceLkr !== 0
  ) {
    alert(
      "Free videos must have a price of zero."
    );

    return;
  }


  if (
    !Number.isInteger(
      maxDurationMinutes
    ) ||
    maxDurationMinutes < 1 ||
    maxDurationMinutes > 600
  ) {
    alert(
      "Maximum duration must be between 1 and 600 minutes."
    );

    return;
  }


  if (
    !videoFile.type.startsWith(
      "video/"
    )
  ) {
    alert(
      "Please choose a valid video file."
    );

    return;
  }


  const maximumFileSize =
    200 *
    1024 *
    1024;


  if (
    videoFile.size >=
    maximumFileSize
  ) {
    alert(
      "Please choose a video smaller than 200 MB. Large resumable uploads will be added later."
    );

    return;
  }


  let createdVideoId =
    "";


  submitButton.disabled =
    true;


  submitButton.textContent =
    "Uploading Video...";


  updateAdminVideoProgress(
    0,
    "Requesting a secure Cloudflare upload link..."
  );


  try {
    /*
      Ask the Firebase backend for a temporary
      Cloudflare upload URL.
    */
    const result =
      await createStreamDirectUpload({
        title:
          title,

        subject:
          subject,

        teacher:
          teacher,

        description:
          description,

        accessType:
          accessType,

        priceLkr:
          priceLkr,

        maxDurationMinutes:
          maxDurationMinutes
      });


    createdVideoId =
      result.data.videoId;


    const uploadURL =
      result.data.uploadURL;


    if (
      !createdVideoId ||
      !uploadURL
    ) {
      throw new Error(
        "The secure Cloudflare upload URL is missing."
      );
    }


    updateAdminVideoProgress(
      1,
      "Secure upload link created. Uploading video..."
    );


    /*
      Upload directly to Cloudflare Stream.
      The Cloudflare API token remains hidden.
    */
    await uploadFileToCloudflare(
      uploadURL,
      videoFile
    );


    updateAdminVideoProgress(
      100,
      "Upload completed. Cloudflare is processing the video."
    );


    /*
      Try one immediate status refresh.
      The video may still be processing, which is normal.
    */
    try {
      await syncStreamVideoStatus({
        videoId:
          createdVideoId
      });

    } catch (statusError) {
      console.warn(
        "Initial video status refresh will be retried later:",
        statusError
      );
    }


    form.reset();


    synchronizeVideoPriceField();


    await loadAdminVideos();


    alert(
      "Video uploaded successfully. Open Videos and click Refresh Status until Cloudflare shows Ready."
    );


  } catch (error) {
    console.error(
      "Cloudflare video upload failed:",
      error
    );


    /*
      Remove incomplete metadata and Cloudflare
      reservation when possible.
    */
    if (
      createdVideoId
    ) {
      try {
        await deleteStreamVideo({
          videoId:
            createdVideoId
        });

      } catch (cleanupError) {
        console.warn(
          "Incomplete video cleanup failed:",
          cleanupError
        );
      }
    }


    alert(
      "The video could not be uploaded. Check the browser Console."
    );


  } finally {
    submitButton.disabled =
      false;


    submitButton.textContent =
      "Upload Video";
  }
}


/* ======================================================
   REPLACE SAMPLE VIDEO TABLE
====================================================== */

function replaceOldVideoLibraryTable() {
  const panel =
    document.getElementById(
      "admin-panel-videos"
    );


  if (
    !panel
  ) {
    return;
  }


  const searchInput =
    panel.querySelector(
      ".table-search"
    );


  if (
    searchInput
  ) {
    searchInput.id =
      "admin-video-search";

    searchInput.placeholder =
      "Search uploaded videos...";
  }


  const table =
    panel.querySelector(
      "table"
    );


  if (
    !table
  ) {
    return;
  }


  table.innerHTML = `
    <thead>
      <tr>
        <th>Video</th>
        <th>Subject</th>
        <th>Teacher</th>
        <th>Access</th>
        <th>Price</th>
        <th>Stream</th>
        <th>Visibility</th>
        <th>Actions</th>
      </tr>
    </thead>

    <tbody id="firebase-admin-videos-body">

      <tr>
        <td colspan="8">
          Loading videos...
        </td>
      </tr>

    </tbody>
  `;
}


/* ======================================================
   STATUS BADGES
====================================================== */

function createStreamStateBadge(
  state
) {
  if (
    state === "ready"
  ) {
    return `
      <span class="badge badge-green">
        Ready
      </span>
    `;
  }


  if (
    state === "error"
  ) {
    return `
      <span class="badge badge-red">
        Error
      </span>
    `;
  }


  if (
    state === "uploading"
  ) {
    return `
      <span class="badge badge-yellow">
        Uploading
      </span>
    `;
  }


  return `
    <span class="badge badge-yellow">
      Processing
    </span>
  `;
}


function createVisibilityBadge(
  status
) {
  if (
    status === "published"
  ) {
    return `
      <span class="badge badge-green">
        Published
      </span>
    `;
  }


  return `
    <span class="badge badge-gray">
      Hidden
    </span>
  `;
}


/* ======================================================
   LOAD REAL FIRESTORE VIDEOS
====================================================== */

async function loadAdminVideos() {
  const tableBody =
    document.getElementById(
      "firebase-admin-videos-body"
    );


  if (
    !tableBody
  ) {
    return;
  }


  tableBody.innerHTML = `
    <tr>
      <td colspan="8">
        Loading videos...
      </td>
    </tr>
  `;


  try {
    const snapshot =
      await getDocs(
        collection(
          db,
          "videos"
        )
      );


    adminVideos =
      snapshot.docs.map(
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


    adminVideos.sort(
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


    renderAdminVideos();


  } catch (error) {
    console.error(
      "Admin videos could not be loaded:",
      error
    );


    tableBody.innerHTML = `
      <tr>
        <td colspan="8">
          Videos could not be loaded.
          Check the browser Console.
        </td>
      </tr>
    `;
  }
}


/* ======================================================
   RENDER VIDEO TABLE
====================================================== */

function renderAdminVideos() {
  const tableBody =
    document.getElementById(
      "firebase-admin-videos-body"
    );


  const searchInput =
    document.getElementById(
      "admin-video-search"
    );


  if (
    !tableBody
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
    adminVideos.filter(
      function (
        video
      ) {
        const text =
          [
            video.title,
            video.subject,
            video.teacher,
            video.accessType,
            video.status,
            video.streamState
          ]
            .join(" ")
            .toLowerCase();


        return text.includes(
          searchText
        );
      }
    );


  if (
    visibleVideos.length ===
    0
  ) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8">
          No uploaded videos were found.
        </td>
      </tr>
    `;


    return;
  }


  tableBody.innerHTML =
    visibleVideos
      .map(
        function (
          video
        ) {
          const videoId =
            escapeAdminVideoText(
              video.id
            );


          const publishText =
            video.status ===
            "published"
              ? "Hide"
              : "Publish";


          return `
            <tr>

              <td>
                ${escapeAdminVideoText(
                  video.title
                )}
              </td>

              <td>
                ${escapeAdminVideoText(
                  video.subject
                )}
              </td>

              <td>
                ${escapeAdminVideoText(
                  video.teacher
                )}
              </td>

              <td>
                ${escapeAdminVideoText(
                  video.accessType ===
                  "paid"
                    ? "Paid"
                    : "Free"
                )}
              </td>

              <td>
                ${formatLkr(
                  video.priceLkr
                )}
              </td>

              <td>
                ${createStreamStateBadge(
                  video.streamState
                )}
              </td>

              <td>
                ${createVisibilityBadge(
                  video.status
                )}
              </td>

              <td>

                <div class="action-row">

                  <button
                    class="act-btn"
                    type="button"
                    data-video-action="refresh"
                    data-video-id="${videoId}">

                    Refresh Status

                  </button>


                  <button
                    class="act-btn"
                    type="button"
                    data-video-action="toggle"
                    data-video-id="${videoId}">

                    ${publishText}

                  </button>


                  <button
                    class="act-btn danger"
                    type="button"
                    data-video-action="remove"
                    data-video-id="${videoId}">

                    Remove

                  </button>

                </div>

              </td>

            </tr>
          `;
        }
      )
      .join("");
}


/* ======================================================
   VIDEO TABLE ACTIONS
====================================================== */

async function refreshAdminVideoStatus(
  videoId
) {
  try {
    await syncStreamVideoStatus({
      videoId:
        videoId
    });


    await loadAdminVideos();


  } catch (error) {
    console.error(
      "Video status refresh failed:",
      error
    );


    alert(
      "The Cloudflare video status could not be refreshed."
    );
  }
}


async function toggleAdminVideoVisibility(
  videoId
) {
  const video =
    adminVideos.find(
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


  const nextStatus =
    video.status ===
    "published"
      ? "hidden"
      : "published";


  if (
    nextStatus === "published" &&
    video.streamState !== "ready"
  ) {
    alert(
      "Wait until Cloudflare processing is Ready before publishing this video."
    );

    return;
  }


  try {
    await updateDoc(
      doc(
        db,
        "videos",
        videoId
      ),
      {
        status:
          nextStatus,

        updatedAt:
          serverTimestamp()
      }
    );


    await loadAdminVideos();


  } catch (error) {
    console.error(
      "Video visibility update failed:",
      error
    );


    alert(
      "The video visibility could not be changed."
    );
  }
}


async function removeAdminVideo(
  videoId
) {
  const confirmed =
    confirm(
      "Remove this video permanently from Cloudflare Stream and the LMS?"
    );


  if (
    !confirmed
  ) {
    return;
  }


  try {
    await deleteStreamVideo({
      videoId:
        videoId
    });


    await loadAdminVideos();


    alert(
      "Video removed successfully."
    );


  } catch (error) {
    console.error(
      "Video removal failed:",
      error
    );


    alert(
      "The video could not be removed."
    );
  }
}


/* ======================================================
   CONNECT VIDEO MANAGER
====================================================== */

function connectAdminVideosManager() {
  if (
    adminVideoManagerConnected
  ) {
    return;
  }


  const form =
    replaceOldVideoUploadForm();


  const videosPanel =
    document.getElementById(
      "admin-panel-videos"
    );


  if (
    !form ||
    !videosPanel
  ) {
    return;
  }


  replaceOldVideoLibraryTable();


  form.addEventListener(
    "submit",
    uploadAdminCloudflareVideo
  );


  const accessInput =
    document.getElementById(
      "video-access-type"
    );


  if (
    accessInput
  ) {
    accessInput.addEventListener(
      "change",
      synchronizeVideoPriceField
    );
  }


  const searchInput =
    document.getElementById(
      "admin-video-search"
    );


  if (
    searchInput
  ) {
    searchInput.addEventListener(
      "input",
      renderAdminVideos
    );
  }


  document.addEventListener(
    "click",
    function (
      event
    ) {
      const button =
        event.target.closest(
          "[data-video-action]"
        );


      if (
        !button
      ) {
        return;
      }


      const videoId =
        button.dataset.videoId;


      const action =
        button.dataset.videoAction;


      if (
        !videoId
      ) {
        return;
      }


      if (
        action === "refresh"
      ) {
        refreshAdminVideoStatus(
          videoId
        );

        return;
      }


      if (
        action === "toggle"
      ) {
        toggleAdminVideoVisibility(
          videoId
        );

        return;
      }


      if (
        action === "remove"
      ) {
        removeAdminVideo(
          videoId
        );
      }
    }
  );


  document.addEventListener(
    "click",
    function (
      event
    ) {
      const sidebarItem =
        event.target.closest(
          ".admin-nav-item"
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
        ) &&
        !text.includes(
          "upload"
        )
      ) {
        loadAdminVideos();
      }
    }
  );


  synchronizeVideoPriceField();


  adminVideoManagerConnected =
    true;


  loadAdminVideos();


  console.log(
    "Cloudflare admin video manager connected."
  );
}


/* ======================================================
   WAIT UNTIL ADMIN.JS CREATES DYNAMIC PANELS
====================================================== */

function attemptAdminVideoManagerSetup() {
  if (
    adminVideoManagerConnected
  ) {
    return;
  }


  connectAdminVideosManager();
}


document.addEventListener(
  "DOMContentLoaded",
  attemptAdminVideoManagerSetup
);


const adminVideoObserver =
  new MutationObserver(
    function () {
      attemptAdminVideoManagerSetup();


      if (
        adminVideoManagerConnected
      ) {
        adminVideoObserver
          .disconnect();
      }
    }
  );


adminVideoObserver.observe(
  document.documentElement,
  {
    childList:
      true,

    subtree:
      true
  }
);