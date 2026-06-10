// /*
//   STUDENT FIREBASE FUNCTIONS WILL GO HERE.

//   Next functions to implement:

//   1. Firebase Login
//   2. Student logout
//   3. Load student courses
//   4. Load videos
//   5. Send PDF requests
//   6. Load approved PDFs
//   7. Send consultation requests
//   8. Display approved consultation sessions

//   The current prototype Login remains available
//   through common.js until Firebase is connected.
// */
// document.addEventListener("DOMContentLoaded", function () {
//   const role = sessionStorage.getItem("lmsRole");

//   if (role !== "student") {
//     window.location.href = "./login.html";
//     return;
//   }

//   const loginGate = document.getElementById("student-login-gate");
//   const dashboard = document.getElementById("student-dashboard");

//   if (loginGate) {
//     loginGate.style.display = "none";
//   }

//   if (dashboard) {
//     dashboard.style.display = "block";
//   }
// });

// window.studentLogout = function () {
//   sessionStorage.removeItem("lmsRole");
//   window.location.href = "./login.html";
// };

/* ======================================================
   FIREBASE STUDENT AUTHENTICATION
====================================================== */

import {
  auth,
  db,
  storage
} from "./firebase-config.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp
  } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

  import {
  ref,
  getBlob
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-storage.js";

  /* ======================================================
   START FIREBASE-PROTECTED STUDENT DASHBOARD
====================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const dashboard =
    document.getElementById("student-dashboard");

  const loginGate =
    document.getElementById("student-login-gate");

  /*
    Hide dashboard until Firebase confirms access.
  */
  if (dashboard) {
    dashboard.style.display = "none";
  }

  onAuthStateChanged(auth, async function (user) {
    if (!user) {
      window.location.href = "./login.html";
      return;
    }

    try {
      const profileReference = doc(
        db,
        "users",
        user.uid
      );

      const profileSnapshot =
        await getDoc(profileReference);

      if (!profileSnapshot.exists()) {
        await signOut(auth);

        window.location.href = "./login.html";
        return;
      }

      const profile = profileSnapshot.data();

      if (
        profile.role !== "student" ||
        profile.status !== "active"
      ) {
        await signOut(auth);

        sessionStorage.clear();

        window.location.href = "./login.html";
        return;
      }

      /*
        Keep these values temporarily because
        some existing LMS features still use them.
      */
      sessionStorage.setItem(
        "lmsRole",
        "student"
      );

      sessionStorage.setItem(
        "lmsUserUid",
        user.uid
      );

      sessionStorage.setItem(
        "lmsUserEmail",
        user.email || ""
      );

      sessionStorage.setItem(
        "lmsUserName",
        profile.name || ""
      );

      if (loginGate) {
        loginGate.style.display = "none";
      }

      if (dashboard) {
        dashboard.style.display = "block";
      }

      /*
        Prevent duplicate page creation if the
        auth observer runs again.
      */
      if (!window.studentDashboardStarted) {
        window.studentDashboardStarted = true;

        createStudentPages();
        createStudentNotesPage();
        connectStudentSidebar();
        connectStudentDashboardRows();
        connectStudentButtons();

        const refreshPdfRequestsButton =
        document.getElementById(
        "refresh-student-pdf-requests"
        );

        if (refreshPdfRequestsButton) {
            refreshPdfRequestsButton.addEventListener(
            "click",
            loadStudentPdfRequestHistory
           );
        }

      }

      

      console.log(
        "Firebase student dashboard connected."
      );

    } catch (error) {
      console.error(
        "Student access check failed:",
        error
      );

      await signOut(auth);

      sessionStorage.clear();

      window.location.href = "./login.html";
    }
  });
});

window.studentLogout = async function () {
  await signOut(auth);

  sessionStorage.clear();

  window.location.href = "./login.html";
};


/* ======================================================
   CREATE STUDENT INTERNAL PAGES
====================================================== */

function createStudentPages() {
  const content = document.querySelector(
    "#student-dashboard .db-content"
  );

  if (!content) {
    console.error("Student content area was not found.");
    return;
  }

  /*
    Prevent duplicate panels after refreshing or rerunning.
  */
  if (document.getElementById("student-panel-dashboard")) {
    return;
  }

  /*
    Keep the existing dashboard overview.
  */
  const existingContent = Array.from(content.childNodes);

  const dashboardPanel = document.createElement("section");

  dashboardPanel.id = "student-panel-dashboard";
  dashboardPanel.className = "student-panel active";

  existingContent.forEach(function (node) {
    dashboardPanel.appendChild(node);
  });

  content.appendChild(dashboardPanel);


  /*
    Add the missing pages.
  */
  content.insertAdjacentHTML(
    "beforeend",
    `
    <!-- ==========================================
         MY COURSES
    =========================================== -->

    <section id="student-panel-my-courses" class="student-panel">

      <div class="section-head">
        <div class="page-title">My Courses</div>

        <div class="page-subtitle">
          View your enrolled courses and learning progress.
        </div>
      </div>

      <div class="student-card-grid">

        <div class="student-card">
          <div class="course-subject">Mathematics</div>

          <div class="course-title">
            Advanced Integration Techniques
          </div>

          <div class="course-teacher">
            Module 4 of 8
          </div>

          <div class="course-progress">
            <div class="course-progress-fill"
              style="width:82%">
            </div>
          </div>
        </div>

        <div class="student-card">
          <div class="course-subject">Chemistry</div>

          <div class="course-title">
            Organic Chemistry Reactions
          </div>

          <div class="course-teacher">
            Module 2 of 6
          </div>

          <div class="course-progress">
            <div class="course-progress-fill"
              style="width:38%">
            </div>
          </div>
        </div>

        <div class="student-card">
          <div class="course-subject">Physics</div>

          <div class="course-title">
            Waves and Oscillations
          </div>

          <div class="course-teacher">
            Module 1 of 5
          </div>

          <div class="course-progress">
            <div class="course-progress-fill"
              style="width:98%">
            </div>
          </div>
        </div>

      </div>
    </section>


    <!-- ==========================================
         VIDEOS
    =========================================== -->

    <section id="student-panel-videos" class="student-panel">

      <div class="section-head">
        <div class="page-title">Videos</div>

        <div class="page-subtitle">
          Watch your lesson videos and continue learning.
        </div>
      </div>

      <div class="table-wrap">

        <div class="table-head-row">
          <div class="table-title">Available Videos</div>

          <input
            class="table-search"
            type="text"
            placeholder="Search videos...">
        </div>

        <table>
          <thead>
            <tr>
              <th>Lesson</th>
              <th>Subject</th>
              <th>Progress</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td>Advanced Integration Techniques</td>
              <td>Mathematics</td>
              <td>82%</td>

              <td>
                <button
                  class="act-btn"
                  data-student-action="watch-video">
                  Watch
                </button>
              </td>
            </tr>

            <tr>
              <td>Organic Chemistry Reactions</td>
              <td>Chemistry</td>
              <td>38%</td>

              <td>
                <button
                  class="act-btn"
                  data-student-action="watch-video">
                  Watch
                </button>
              </td>
            </tr>

            <tr>
              <td>Waves and Oscillations</td>
              <td>Physics</td>
              <td>98%</td>

              <td>
                <button
                  class="act-btn"
                  data-student-action="watch-video">
                  Watch
                </button>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </section>


    <!-- ==========================================
         PDF LIBRARY
    =========================================== -->

    <section id="student-panel-pdf-library" class="student-panel">

      <div class="section-head">
        <div class="page-title">PDF Library</div>

        <div class="page-subtitle">
          View your approved study materials.
        </div>
      </div>

      <div class="table-wrap">

        <div class="table-head-row">
          <div class="table-title">Approved PDF Files</div>

          <input
            class="table-search"
            type="text"
            placeholder="Search PDFs...">
        </div>

        <table>
          <thead>
            <tr>
              <th>PDF Resource</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td>Chemistry Notes 2026</td>
              <td>Chemistry</td>

              <td>
                <span class="badge badge-green">
                  Approved
                </span>
              </td>

              <td>
                <button
                  class="act-btn"
                  data-student-action="view-pdf">
                  View
                </button>
              </td>
            </tr>

            <tr>
              <td>Mathematics Formula Sheet</td>
              <td>Mathematics</td>

              <td>
                <span class="badge badge-green">
                  Approved
                </span>
              </td>

              <td>
                <button
                  class="act-btn"
                  data-student-action="view-pdf">
                  View
                </button>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </section>


    <!-- ==========================================
         REQUEST PDF
    =========================================== -->

    <section id="student-panel-request-pdf" class="student-panel">

      <div class="section-head">
        <div class="page-title">Request PDF</div>

        <div class="page-subtitle">
          Send a PDF access request to the admin.
        </div>
      </div>

      <form
        id="student-pdf-request-form"
        class="student-page-card">

        <div class="form-grid">

          <div class="form-group">
            <label class="form-label">
              PDF Name
            </label>

            <input
              id="student-pdf-request-name"
              class="form-input"
              type="text"
              placeholder=""
              required>
          </div>

          <div class="form-group">
            <label class="form-label">
              Subject
            </label>

            <select
              id="student-pdf-request-subject"
              class="form-select">
              <option>Mathematics</option>
              <option>Physics</option>
              <option>Chemistry</option>
              <option>Biology</option>
              <option>English</option>
            </select>
          </div>

        </div>

        <div class="form-group" style="margin-bottom:20px">
          <label class="form-label">
            Reason
          </label>

          <textarea
            id="student-pdf-request-reason"
            class="form-input"
            rows="5"
            placeholder="Enter a short message"
            required></textarea>
        </div>

        <button
          class="btn-large btn-yellow"
          type="submit">
          Send PDF Request
        </button>

      </form>

      <div
  class="table-wrap"
  style="margin-top:28px">

  <div class="table-head-row">
    <div class="table-title">
      My PDF Requests
    </div>

    <button
      id="refresh-student-pdf-requests"
      class="act-btn"
      type="button">
      Refresh
    </button>
  </div>

  <table>
    <thead>
      <tr>
        <th>PDF Resource</th>
        <th>Subject</th>
        <th>Requested Date</th>
        <th>Status</th>
      </tr>
    </thead>

    <tbody id="student-pdf-request-history">
    </tbody>
  </table>

</div>

    </section>


    <!-- ==========================================
         BOOK CONSULTATION
    =========================================== -->

    <section
      id="student-panel-book-consultation"
      class="student-panel">

      <div class="section-head">
        <div class="page-title">Book Consultation</div>

        <div class="page-subtitle">
          Request a private learning-support session.
        </div>
      </div>

      <form
        id="student-consultation-form"
        class="student-page-card">

        <div class="form-grid">

          <div class="form-group">
            <label class="form-label">
              Subject
            </label>

            <select
              id="student-consultation-subject"
              class="form-select">
              <option>Mathematics</option>
              <option>Physics</option>
              <option>Chemistry</option>
              <option>Biology</option>
              <option>English</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">
              Preferred Date
            </label>

            <input
              class="form-input"
              type="date"
              required>
          </div>

        </div>

        <div class="form-group" style="margin-bottom:20px">
          <label class="form-label">
            Message
          </label>

          <textarea
            class="form-input"
            rows="5"
            placeholder="Tell the teacher what you need help with"
            required></textarea>
        </div>

        <button
          class="btn-large btn-yellow"
          type="submit">
          Request Consultation
        </button>

      </form>
    </section>


    <!-- ==========================================
         MY SESSIONS
    =========================================== -->

    <section id="student-panel-my-sessions" class="student-panel">

      <div class="section-head">
        <div class="page-title">My Sessions</div>

        <div class="page-subtitle">
          View consultation schedules and meeting links.
        </div>
      </div>

      <div class="table-wrap">

        <div class="table-head-row">
          <div class="table-title">
            Consultation Sessions
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Session</th>
              <th>Date</th>
              <th>Teacher</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td>Exam Prep - Mathematics</td>
              <td>10 Jun 2026 - 4:00 PM</td>
              <td>Mr. Perera</td>

              <td>
                <span class="badge badge-green">
                  Confirmed
                </span>
              </td>

              <td>
                <button
                  class="act-btn"
                  data-student-action="join-session">
                  Join
                </button>
              </td>
            </tr>

            <tr>
              <td>Physics Subject Help</td>
              <td>Pending</td>
              <td>Ms. Silva</td>

              <td>
                <span class="badge badge-yellow">
                  Pending
                </span>
              </td>

              <td>
                <button
                  class="act-btn"
                  data-student-action="view-session">
                  View
                </button>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </section>


    <!-- ==========================================
         NOTIFICATIONS
    =========================================== -->

    <section
      id="student-panel-notifications"
      class="student-panel">

      <div class="section-head">
        <div class="page-title">Notifications</div>

        <div class="page-subtitle">
          View course updates and admin messages.
        </div>
      </div>

      <div class="student-scroll-list">

        <div class="student-note-row">
          <strong>PDF request approved</strong>

          <div class="course-teacher">
            2 hours ago · Chemistry Notes 2026
          </div>
        </div>

        <div class="student-note-row">
          <strong>New video added to your course</strong>

          <div class="course-teacher">
            Yesterday · Module 5: Differentiation
          </div>
        </div>

        <div class="student-note-row">
          <strong>Consultation confirmed</strong>

          <div class="course-teacher">
            Exam Prep - Mathematics · 10 Jun 2026
          </div>
        </div>

      </div>
    </section>
    `
  );
}


/* ======================================================
   SIDEBAR NAVIGATION
====================================================== */

function connectStudentSidebar() {
  const sidebar = document.querySelector(
    "#student-dashboard .db-sidebar"
  );

  if (!sidebar) {
    console.error("Student sidebar was not found.");
    return;
  }

  sidebar.addEventListener("click", function (event) {
    const item = event.target.closest(".db-nav-item");

    if (!item) {
      return;
    }

    const text = item.textContent
      .trim()
      .toLowerCase();

    if (text.includes("sign out")) {
      return;
    }

    if (text.includes("dashboard")) {
      showStudentPanel("dashboard", item);
      return;
    }

    if (text.includes("my courses")) {
      showStudentPanel("my-courses", item);
      return;
    }

    if (text.includes("videos")) {
      showStudentPanel("videos", item);
      return;
    }

    if (text.includes("pdf library")) {
  showStudentPanel("pdf-library", item);
  return;
}

if (text.includes("study notes")) {
  showStudentPanel("study-notes", item);
  renderStudentNotes("all");
  return;
}

if (text.includes("request pdf")) {
  showStudentPanel("request-pdf", item);
  return;
}

    if (text.includes("book consultation")) {
      showStudentPanel("book-consultation", item);
      return;
    }

    if (text.includes("my sessions")) {
      showStudentPanel("my-sessions", item);
      return;
    }

    if (text.includes("notifications")) {
      showStudentPanel("notifications", item);
    }
  });
}


function showStudentPanel(panelName, selectedItem) {
  document
    .querySelectorAll("#student-dashboard .student-panel")
    .forEach(function (panel) {
      panel.classList.remove("active");
    });

  const selectedPanel = document.getElementById(
    "student-panel-" + panelName
  );

  if (!selectedPanel) {
    console.error("Student panel not found:", panelName);
    return;
  }

  selectedPanel.classList.add("active");

  if (panelName === "pdf-library") {
  loadStudentPdfLibrary();
}

if (panelName === "request-pdf") {
  loadStudentPdfRequestHistory();
}

if (panelName === "study-notes") {
  window.renderStudentNotes("all");
}

  document
    .querySelectorAll("#student-dashboard .db-nav-item")
    .forEach(function (item) {
      item.classList.remove("active");
    });

  if (selectedItem) {
    selectedItem.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* ======================================================
   DASHBOARD CONTINUE WATCHING AND NOTIFICATION LINKS
====================================================== */

function connectStudentDashboardRows() {
  const dashboard = document.getElementById(
    "student-panel-dashboard"
  );

  if (!dashboard) {
    return;
  }

  dashboard
    .querySelectorAll(".db-course-row")
    .forEach(function (row) {
      row.classList.add("student-click-row");

      const text = row.textContent
        .trim()
        .toLowerCase();

      if (
        text.includes("integration") ||
        text.includes("organic chemistry") ||
        text.includes("waves")
      ) {
        row.addEventListener("click", function () {
          openStudentPage("videos");
        });

        return;
      }

      if (
        text.includes("pdf request") ||
        text.includes("video added") ||
        text.includes("notification")
      ) {
        row.addEventListener("click", function () {
          openStudentPage("notifications");
        });
      }
    });
}


function openStudentPage(pageName) {
  const items = Array.from(
    document.querySelectorAll(
      "#student-dashboard .db-nav-item"
    )
  );

  const item = items.find(function (navItem) {
    return navItem.textContent
      .trim()
      .toLowerCase()
      .includes(pageName);
  });

  if (item) {
    item.click();
  }
}


/* ======================================================
   BUTTON AND FORM ACTIONS
====================================================== */

function connectStudentButtons() {
  const pdfForm = document.getElementById(
    "student-pdf-request-form"
  );

  if (pdfForm) {
    pdfForm.addEventListener(
    "submit",
    submitFirebasePdfRequest
  );
  }


  const consultationForm = document.getElementById(
    "student-consultation-form"
  );

  if (consultationForm) {
    consultationForm.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();

        alert("Consultation request sent to the admin.");

        consultationForm.reset();
      }
    );
  }


  document.addEventListener("click", function (event) {
    const button = event.target.closest(
      "[data-student-action]"
    );

    if (!button) {
      return;
    }

    const action = button.dataset.studentAction;

    if (action === "watch-video") {
      alert(
        "The video player will open here after video links are connected."
      );
    }

    if (action === "view-pdf") {
      alert(
        "The PDF viewer will open here after Firebase Storage is connected."
      );
    }

    if (action === "join-session") {
      alert(
        "The meeting link will open here after admin approval."
      );
    }

    if (action === "view-session") {
      alert("Session details will appear here.");
    }
  });
}

/* ======================================================
   RELIABLE STUDENT PAGE NAVIGATION
====================================================== */

window.openStudentPanel = function (panelName) {
  const selectedPanel = document.getElementById(
    "student-panel-" + panelName
  );

  if (!selectedPanel) {
    console.error("Student page does not exist:", panelName);
    return;
  }

  document
    .querySelectorAll("#student-dashboard .student-panel")
    .forEach(function (panel) {
      panel.classList.remove("active");
    });

  selectedPanel.classList.add("active");

    if (panelName === "pdf-library") {
      loadStudentPdfLibrary();
      }

    if (panelName === "request-pdf") {
        loadStudentPdfRequestHistory();
      }

  const labelMap = {
    "dashboard": "dashboard",
    "my-courses": "my courses",
    "videos": "videos",
    "pdf-library": "pdf library",
    "study-notes": "study notes",
    "request-pdf": "request pdf",
    "book-consultation": "book consultation",
    "my-sessions": "my sessions",
    "notifications": "notifications"
  };

  document
    .querySelectorAll("#student-dashboard .db-nav-item")
    .forEach(function (item) {
      item.classList.remove("active");

      const itemText = item.textContent
        .trim()
        .toLowerCase();

      if (
        labelMap[panelName] &&
        itemText.includes(labelMap[panelName])
      ) {
        item.classList.add("active");
      }
    });

  if (panelName === "study-notes") {
    window.renderStudentNotes("all");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};

/* ======================================================
   STUDENT STUDY NOTES PAGE
   Temporary browser-storage version
====================================================== */

function createStudentNotesPage() {
  const content = document.querySelector(
    "#student-dashboard .db-content"
  );

  if (!content) {
    console.error("Student dashboard content area was not found.");
    return;
  }

  if (document.getElementById("student-panel-study-notes")) {
    return;
  }

  content.insertAdjacentHTML(
    "beforeend",
    `
    <section
      id="student-panel-study-notes"
      class="student-panel">

      <div class="section-head">
        <div class="section-label">
          Learning Resources ✦
        </div>

        <div class="page-title">
          Study Notes
        </div>

        <div class="page-subtitle">
          Browse visual revision notes published by your teachers.
        </div>
      </div>

      <div class="student-notes-toolbar">

        <div>
          <div class="student-notes-heading">
            Notes Library
          </div>

          <div class="student-notes-subheading">
            Open any note to view the full-size image.
          </div>
        </div>

        <select
          id="student-notes-filter"
          class="form-select student-notes-filter">

          <option value="all">All Subjects</option>
          <option value="mathematics">Mathematics</option>
          <option value="physics">Physics</option>
          <option value="chemistry">Chemistry</option>
          <option value="biology">Biology</option>
          <option value="english">English</option>
          <option value="economics">Economics</option>
          <option value="history">History</option>
          <option value="computer-science">Computer Science</option>

        </select>
      </div>

      <div
        id="student-notes-grid"
        class="student-notes-grid">
      </div>

    </section>
    `
  );

  document
    .getElementById("student-notes-filter")
    .addEventListener("change", function () {
      window.renderStudentNotes(this.value);
    });

  createStudentNoteModal();
}


/* ------------------------------------------------------
   READ ACTIVE NOTES FROM ADMIN STORAGE
------------------------------------------------------ */

function getStudentVisibleNotes() {
  try {
    const notes = JSON.parse(
      localStorage.getItem(
        "browseATeacherStudyNotes"
      ) || "[]"
    );

    return notes.filter(function (note) {
      return note.active !== false;
    });
  } catch (error) {
    console.error("Could not read student notes:", error);
    return [];
  }
}


/* ------------------------------------------------------
   DISPLAY NOTE CARDS
------------------------------------------------------ */

window.renderStudentNotes = function (selectedSubject) {
  const grid = document.getElementById(
    "student-notes-grid"
  );

  if (!grid) {
    return;
  }

  const subject = selectedSubject || "all";

  const notes = getStudentVisibleNotes()
    .filter(function (note) {
      return (
        subject === "all" ||
        note.subject === subject
      );
    });

  if (notes.length === 0) {
    grid.innerHTML = `
      <div class="student-notes-empty">

        <div class="student-notes-empty-icon">
          📝
        </div>

        <div class="student-notes-empty-title">
          No study notes available yet
        </div>

        <div class="student-notes-empty-text">
          Published notes will appear here.
        </div>

      </div>
    `;

    return;
  }

  grid.innerHTML = notes
    .map(function (note) {
      return `
        <article class="student-note-card">

          <div class="student-note-image-wrap">

            <img
              class="student-note-image"
              src="${escapeStudentNoteText(note.imageUrl)}"
              alt="${escapeStudentNoteText(note.title)}">

            <div class="student-note-badge">
              ${escapeStudentNoteText(
                formatStudentNoteSubject(note.subject)
              )}
            </div>

          </div>

          <div class="student-note-body">

            <div class="student-note-mini-label">
              Visual Revision Note ✦
            </div>

            <div class="student-note-title">
              ${escapeStudentNoteText(note.title)}
            </div>

            <p class="student-note-description">
              ${escapeStudentNoteText(note.description)}
            </p>

            <button
              class="btn-large btn-yellow student-note-view-btn"
              type="button"
              data-student-note-id="${escapeStudentNoteText(note.id)}">
              View Note
            </button>

          </div>
        </article>
      `;
        })
    .join("");


  grid
    .querySelectorAll("[data-student-note-id]")
    .forEach(function (button) {
      button.addEventListener(
        "click",
        function () {
          const noteId =
            button.dataset.studentNoteId;

          const note =
            getStudentVisibleNotes()
              .find(function (item) {
                return item.id === noteId;
              });

          if (note) {
            openStudentNoteModal(note);
          }
        }
      );
    });
};


/* ------------------------------------------------------
   NOTE PREVIEW POPUP
------------------------------------------------------ */
 


/* ------------------------------------------------------
   NOTE PREVIEW POPUP
------------------------------------------------------ */

function createStudentNoteModal() {
  if (document.getElementById("student-note-modal")) {
    return;
  }

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div
      id="student-note-modal"
      class="student-note-modal">

      <div class="student-note-modal-card">

        <button
          type="button"
          class="student-note-modal-close"
          onclick="closeStudentNoteModal()">
          ×
        </button>

        <div class="section-label">
          Study Note Preview ✦
        </div>

        <div
          id="student-note-modal-title"
          class="student-note-modal-title">
        </div>

        <img
          id="student-note-modal-image"
          class="student-note-modal-image"
          src=""
          alt="Study note preview">

      </div>
    </div>
    `
  );

  document
    .getElementById("student-note-modal")
    .addEventListener("click", function (event) {
      if (event.target === this) {
        window.closeStudentNoteModal();
      }
    });
}


function openStudentNoteModal(note) {
  const modal = document.getElementById(
    "student-note-modal"
  );

  const title = document.getElementById(
    "student-note-modal-title"
  );

  const image = document.getElementById(
    "student-note-modal-image"
  );

  if (!modal || !title || !image) {
    return;
  }

  title.textContent = note.title;
  image.src = note.imageUrl;
  image.alt = note.title;

  modal.classList.add("open");

  document.body.style.overflow = "hidden";
}


window.closeStudentNoteModal = function () {
  const modal = document.getElementById(
    "student-note-modal"
  );

  if (modal) {
    modal.classList.remove("open");
  }

  document.body.style.overflow = "";
};


/* ------------------------------------------------------
   SAFE TEXT DISPLAY
------------------------------------------------------ */

function escapeStudentNoteText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function formatStudentNoteSubject(subject) {
  return String(subject || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, function (letter) {
      return letter.toUpperCase();
    });
}


/* Refresh Notes when admin changes storage in another tab */
window.addEventListener("storage", function (event) {
  if (event.key === "browseATeacherStudyNotes") {
    window.renderStudentNotes("all");
  }
});



/* ------------------------------------------------------
   LOAD THIS STUDENT'S PDF REQUESTS
------------------------------------------------------ */

async function loadStudentPdfRequestHistory() {
  const tableBody = document.getElementById(
    "student-pdf-request-history"
  );

  const user = auth.currentUser;

  if (!tableBody || !user) {
    return;
  }

  tableBody.innerHTML = `
    <tr>
      <td colspan="4">
        Loading requests...
      </td>
    </tr>
  `;

  try {
    const requestQuery = query(
      collection(db, "pdfRequests"),
      where("studentUid", "==", user.uid)
    );

    const snapshot =
      await getDocs(requestQuery);

    const requests = [];

    snapshot.forEach(function (requestDocument) {
      requests.push({
        id: requestDocument.id,
        ...requestDocument.data()
      });
    });

    /*
      Sort newest first without requiring
      a Firestore composite index.
    */
    requests.sort(function (a, b) {
      const aTime =
        a.createdAt?.seconds || 0;

      const bTime =
        b.createdAt?.seconds || 0;

      return bTime - aTime;
    });


    if (requests.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4">
            You have not submitted any PDF requests yet.
          </td>
        </tr>
      `;

      return;
    }


    tableBody.innerHTML = requests
      .map(function (request) {
        return `
          <tr>

            <td>
              ${escapePdfRequestText(
                request.pdfName
              )}
            </td>

            <td>
              ${escapePdfRequestText(
                request.subject
              )}
            </td>

            <td>
              ${formatPdfRequestDate(
                request.createdAt
              )}
            </td>

            <td>
              ${createPdfRequestBadge(
                request.status
              )}
            </td>

          </tr>
        `;
      })
      .join("");

  } catch (error) {
    console.error(
      "Could not load student PDF requests:",
      error
    );

    tableBody.innerHTML = `
      <tr>
        <td colspan="4">
          Requests could not be loaded.
        </td>
      </tr>
    `;
  }
}


/* ------------------------------------------------------
   STUDENT PDF REQUEST HELPERS
------------------------------------------------------ */

function createPdfRequestBadge(status) {
  if (status === "approved") {
    return `
      <span class="badge badge-green">
        Approved
      </span>
    `;
  }

  if (status === "rejected") {
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


function formatPdfRequestDate(timestamp) {
  if (!timestamp || !timestamp.toDate) {
    return "Just now";
  }

  return timestamp
    .toDate()
    .toLocaleDateString("en-GB");
}


function escapePdfRequestText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* ======================================================
   SEND PDF REQUEST TO FIRESTORE
====================================================== */

async function submitFirebasePdfRequest(event) {
  event.preventDefault();

  console.log("PDF request submit started.");

  const user = auth.currentUser;

  if (!user) {
    alert("Please log in again.");
    window.location.href = "./login.html";
    return;
  }

  const nameInput = document.getElementById(
    "student-pdf-request-name"
  );

  const subjectInput = document.getElementById(
    "student-pdf-request-subject"
  );

  const reasonInput = document.getElementById(
    "student-pdf-request-reason"
  );

  if (!nameInput || !subjectInput || !reasonInput) {
    console.error(
      "PDF request form fields were not found."
    );

    alert(
      "The PDF request form is incomplete. Check the Console."
    );

    return;
  }

  const pdfName = nameInput.value.trim();
  const subject = subjectInput.value;
  const reason = reasonInput.value.trim();

  if (!pdfName || !subject || !reason) {
    alert("Please complete all PDF request fields.");
    return;
  }

  const form = document.getElementById(
    "student-pdf-request-form"
  );

  const submitButton = form.querySelector(
    'button[type="submit"]'
  );

  submitButton.disabled = true;
  submitButton.textContent = "Sending Request...";

  try {
    const requestReference = await addDoc(
      collection(db, "pdfRequests"),
      {
        studentUid: user.uid,

        studentName:
          sessionStorage.getItem("lmsUserName") ||
          user.displayName ||
          "Student",

        studentEmail:
          user.email || "",

        pdfName: pdfName,
        subject: subject,
        reason: reason,

        status: "pending",

        createdAt: serverTimestamp()
      }
    );

    console.log(
      "PDF request created:",
      requestReference.id
    );

    form.reset();

    alert("PDF request sent successfully.");

    await loadStudentPdfRequestHistory();

  } catch (error) {
    console.error(
      "PDF request Firestore error:",
      error
    );

    alert(
      "The PDF request could not be saved. Check the Console."
    );

  } finally {
    submitButton.disabled = false;

    submitButton.textContent =
      "Send PDF Request";
  }
}

/* ======================================================
   FIREBASE STUDENT PDF LIBRARY
====================================================== */

function ensureStudentPdfLibraryContainer() {
  const pdfPanel = document.getElementById(
    "student-panel-pdf-library"
  );

  if (!pdfPanel) {
    console.error(
      "Student PDF Library panel was not found."
    );

    return null;
  }

  let grid = document.getElementById(
    "student-pdf-library-grid"
  );

  if (grid) {
    return grid;
  }

  pdfPanel.insertAdjacentHTML(
    "beforeend",
    `
    <div class="section-head">
      <div class="section-label">
        Learning Resources ✦
      </div>

      <div class="page-title">
        PDF Library
      </div>

      <div class="page-subtitle">
        Browse PDF resources uploaded by your teachers.
      </div>
    </div>


    <div
      id="student-pdf-library-grid"
      class="student-pdf-library-grid">
    </div>
    `
  );

  return document.getElementById(
    "student-pdf-library-grid"
  );
}


/* ------------------------------------------------------
   LOAD ACTIVE PDF RESOURCES
------------------------------------------------------ */

async function loadStudentPdfLibrary() {
  const grid =
    ensureStudentPdfLibraryContainer();

  if (!grid) {
    return;
  }

  grid.innerHTML = `
    <div class="student-pdf-library-empty">
      Loading PDF resources...
    </div>
  `;

  try {
    const snapshot =
      await getDocs(
        collection(
          db,
          "pdfResources"
        )
      );

    const pdfResources = [];

    snapshot.forEach(function (pdfDocument) {
      const resource =
        pdfDocument.data();

      if (resource.status === "active") {
        pdfResources.push({
          id: pdfDocument.id,
          ...resource
        });
      }
    });


    pdfResources.sort(function (a, b) {
      const aTime =
        a.createdAt?.seconds || 0;

      const bTime =
        b.createdAt?.seconds || 0;

      return bTime - aTime;
    });

    const accessRequests =
    await loadCurrentStudentPdfAccessRequests();

    if (pdfResources.length === 0) {
      grid.innerHTML = `
        <div class="student-pdf-library-empty">

          <div style="
            font-size:30px;
            margin-bottom:10px;
          ">
            📄
          </div>

          No PDF resources are available yet.

        </div>
      `;

      return;
    }

    

    grid.innerHTML = pdfResources
      .map(function (resource) {
        const requiresApproval =
          resource.approvalRequired === true;

        const accessStatus =
        getStudentPdfAccessStatus(
        resource.id,
        accessRequests
        );

        return `
          <article class="student-pdf-card">

            <div class="student-pdf-icon">
              📄
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
              ${
                requiresApproval
                  ? `
                    <span class="badge badge-yellow">
                      Approval Required
                    </span>
                  `
                  : `
                    <span class="badge badge-green">
                      Available
                    </span>
                  `
              }
            </div>


            ${
  !requiresApproval ||
  accessStatus === "approved"

    ? `
      <button
        class="btn-large btn-yellow student-pdf-button"
        type="button"
        data-open-pdf-resource="${escapeStudentPdfText(
          resource.id
        )}">
        Open PDF
      </button>
    `

    : accessStatus === "pending"

      ? `
        <button
          class="btn-large btn-outline student-pdf-button"
          type="button"
          disabled>
          Pending Approval
        </button>
      `

      : `
        <button
          class="btn-large btn-outline student-pdf-button"
          type="button"
          data-request-pdf-access="${escapeStudentPdfText(
            resource.id
          )}">
          ${
            accessStatus === "rejected"
              ? "Request Again"
              : "Request Access"
          }
        </button>
      `
}

          </article>
        `;
      })
      .join("");

      grid
  .querySelectorAll(
    "[data-open-pdf-resource]"
  )
  .forEach(function (button) {
    button.addEventListener(
      "click",
      async function () {
        await openStudentPdfResource(
          button.dataset.openPdfResource,
          pdfResources
        );
      }
    );
  });

    grid
  .querySelectorAll(
    "[data-request-pdf-access]"
  )
  .forEach(function (button) {
    button.addEventListener(
      "click",
      async function () {
        await requestStudentPdfAccess(
          button.dataset.requestPdfAccess,
          pdfResources,
          button
        );
      }
    );
  });


    

  } catch (error) {
    console.error(
      "Could not load PDF Library:",
      error
    );

    grid.innerHTML = `
      <div class="student-pdf-library-empty">
        PDF resources could not be loaded.
        Check the browser Console.
      </div>
    `;
  }
}

/* ------------------------------------------------------
   OPEN PDF INSIDE PROTECTED VIEWER
------------------------------------------------------ */

async function openStudentPdfResource(
  resourceId,
  resources
) {
  const resource = resources.find(
    function (item) {
      return item.id === resourceId;
    }
  );

  if (!resource) {
    alert(
      "The PDF resource could not be found."
    );

    return;
  }

  try {
    /*
      Confirm the student has approval before
      retrieving the PDF file.
    */
    const mayOpenPdf =
      await canStudentOpenPdfResource(
        resource
      );

    if (!mayOpenPdf) {
      alert(
        "This PDF requires administrator approval."
      );

      await loadStudentPdfLibrary();

      return;
    }

    if (!resource.storagePath) {
      alert(
        "The PDF storage path is missing. Please contact the administrator."
      );

      return;
    }

    openProtectedPdfViewer(
      resource.title
    );

    /*
      Retrieve PDF bytes privately through
      the Firebase SDK instead of exposing
      the download URL.
    */
    const pdfReference = ref(
      storage,
      resource.storagePath
    );

    const pdfBlob =
      await getBlob(
        pdfReference
      );

    const pdfArrayBuffer =
      await pdfBlob.arrayBuffer();

    await renderProtectedPdfPages(
      pdfArrayBuffer
    );

  } catch (error) {
    console.error(
      "Protected PDF viewer error:",
      error
    );

    closeProtectedPdfViewer();

    alert(
      "The PDF could not be opened. Check the browser Console."
    );
  }
}

/* ------------------------------------------------------
   SAFE TEXT OUTPUT
------------------------------------------------------ */

function escapeStudentPdfText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
/* ======================================================
   STUDENT PDF LIBRARY ACCESS REQUESTS
====================================================== */

async function loadCurrentStudentPdfAccessRequests() {
  const user = auth.currentUser;

  if (!user) {
    return [];
  }

  try {
    const requestQuery = query(
      collection(db, "pdfRequests"),
      where("studentUid", "==", user.uid)
    );

    const snapshot =
      await getDocs(requestQuery);

    const requests = [];

    snapshot.forEach(function (requestDocument) {
      const request =
        requestDocument.data();

      if (
        request.requestType ===
        "library-access"
      ) {
        requests.push({
          id: requestDocument.id,
          ...request
        });
      }
    });

    return requests;

  } catch (error) {
    console.error(
      "Could not load PDF access requests:",
      error
    );

    return [];
  }
}


/* ------------------------------------------------------
   CHECK STATUS FOR ONE PDF RESOURCE
------------------------------------------------------ */

function getStudentPdfAccessStatus(
  resourceId,
  accessRequests
) {
  const matchingRequests =
    accessRequests.filter(
      function (request) {
        return (
          request.resourceId === resourceId
        );
      }
    );

  if (
    matchingRequests.some(
      function (request) {
        return request.status === "approved";
      }
    )
  ) {
    return "approved";
  }

  if (
    matchingRequests.some(
      function (request) {
        return request.status === "pending";
      }
    )
  ) {
    return "pending";
  }

  if (
    matchingRequests.some(
      function (request) {
        return request.status === "rejected";
      }
    )
  ) {
    return "rejected";
  }

  return "not-requested";
}


/* ------------------------------------------------------
   SEND ACCESS REQUEST
------------------------------------------------------ */

async function requestStudentPdfAccess(
  resourceId,
  resources,
  button
) {
  const user = auth.currentUser;

  if (!user) {
    alert("Please sign in again.");

    window.location.href =
      "./login.html";

    return;
  }

  const resource = resources.find(
    function (item) {
      return item.id === resourceId;
    }
  );

  if (!resource) {
    alert(
      "The PDF resource could not be found."
    );

    return;
  }

  button.disabled = true;

  button.textContent =
    "Sending Request...";

  try {
    const existingRequests =
      await loadCurrentStudentPdfAccessRequests();

    const currentStatus =
      getStudentPdfAccessStatus(
        resourceId,
        existingRequests
      );

    if (currentStatus === "approved") {
      alert(
        "You already have access to this PDF."
      );

      await loadStudentPdfLibrary();

      return;
    }

    if (currentStatus === "pending") {
      alert(
        "Your access request is already pending."
      );

      await loadStudentPdfLibrary();

      return;
    }

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
          ) ||
          user.displayName ||
          "Student",

        studentEmail:
          user.email || "",

        pdfName:
          resource.title,

        subject:
          resource.subject,

        reason:
          "Requested access from the PDF Library.",

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

    await loadStudentPdfLibrary();

  } catch (error) {
    console.error(
      "PDF access request failed:",
      error
    );

    alert(
      "The access request could not be sent. Check the Console."
    );

  } finally {
    button.disabled = false;
  }
}


/* ------------------------------------------------------
   CHECK WHETHER STUDENT MAY OPEN PDF
------------------------------------------------------ */

async function canStudentOpenPdfResource(
  resource
) {
  if (
    resource.approvalRequired !== true
  ) {
    return true;
  }


  const accessRequests =
    await loadCurrentStudentPdfAccessRequests();


  const status =
    getStudentPdfAccessStatus(
      resource.id,
      accessRequests
    );


  return status === "approved";
}

/* ======================================================
   PROTECTED PDF CANVAS VIEWER
====================================================== */

function createProtectedPdfViewer() {
  if (
    document.getElementById(
      "protected-pdf-viewer"
    )
  ) {
    return;
  }

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div
      id="protected-pdf-viewer"
      class="protected-pdf-viewer">

      <div class="protected-pdf-viewer-head">

        <div>
          <div class="section-label">
            Secure PDF Viewer ✦
          </div>

          <div
            id="protected-pdf-viewer-title"
            class="protected-pdf-viewer-title">
            PDF Resource
          </div>
        </div>

        <button
          type="button"
          class="protected-pdf-close"
          onclick="closeProtectedPdfViewer()">
          ×
        </button>

      </div>


      <div class="protected-pdf-notice">
        View-only learning material · Downloading and printing are disabled.
      </div>


      <div
        id="protected-pdf-pages"
        class="protected-pdf-pages">

        <div class="protected-pdf-loading">
          Loading your PDF...
        </div>

      </div>

    </div>
    `
  );

  /*
    Block easy right-click saving.
  */
  document
    .getElementById("protected-pdf-viewer")
    .addEventListener(
      "contextmenu",
      function (event) {
        event.preventDefault();
      }
    );
}


function openProtectedPdfViewer(title) {
  createProtectedPdfViewer();

  const viewer =
    document.getElementById(
      "protected-pdf-viewer"
    );

  const titleElement =
    document.getElementById(
      "protected-pdf-viewer-title"
    );

  const pages =
    document.getElementById(
      "protected-pdf-pages"
    );

  titleElement.textContent =
    title || "PDF Resource";

  pages.innerHTML = `
    <div class="protected-pdf-loading">
      Loading your PDF...
    </div>
  `;

  viewer.classList.add("open");

  document.body.style.overflow =
    "hidden";
}


window.closeProtectedPdfViewer =
  function () {
    const viewer =
      document.getElementById(
        "protected-pdf-viewer"
      );

    if (viewer) {
      viewer.classList.remove("open");
    }

    document.body.style.overflow =
      "";
  };


async function renderProtectedPdfPages(
  pdfArrayBuffer
) {
  if (!window.pdfjsLib) {
    throw new Error(
      "PDF.js library did not load."
    );
  }

  window.pdfjsLib
    .GlobalWorkerOptions
    .workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


  const pagesContainer =
    document.getElementById(
      "protected-pdf-pages"
    );

  pagesContainer.innerHTML = "";


  const loadingTask =
    window.pdfjsLib.getDocument({
      data: new Uint8Array(
        pdfArrayBuffer
      )
    });


  const pdfDocument =
    await loadingTask.promise;


  for (
    let pageNumber = 1;
    pageNumber <= pdfDocument.numPages;
    pageNumber += 1
  ) {
    const page =
      await pdfDocument.getPage(
        pageNumber
      );

    const viewport =
      page.getViewport({
        scale: 1.4
      });


    const pageWrap =
      document.createElement("div");

    pageWrap.className =
      "protected-pdf-page-wrap";


    const watermark =
      document.createElement("div");

    watermark.className =
      "protected-pdf-watermark";

    watermark.textContent =
      sessionStorage.getItem(
        "lmsUserEmail"
      ) ||
      "Browse A Teacher Student";


    const canvas =
      document.createElement("canvas");

    canvas.className =
      "protected-pdf-canvas";

    canvas.width =
      viewport.width;

    canvas.height =
      viewport.height;


    pageWrap.appendChild(canvas);

    pageWrap.appendChild(watermark);

    pagesContainer.appendChild(
      pageWrap
    );


    const context =
      canvas.getContext("2d");


    await page
      .render({
        canvasContext: context,
        viewport: viewport
      })
      .promise;
  }
}


/* ------------------------------------------------------
   BLOCK COMMON SAVE AND PRINT SHORTCUTS
------------------------------------------------------ */

document.addEventListener(
  "keydown",
  function (event) {
    const viewer =
      document.getElementById(
        "protected-pdf-viewer"
      );

    if (
      !viewer ||
      !viewer.classList.contains("open")
    ) {
      return;
    }

    const key =
      event.key.toLowerCase();

    if (
      event.ctrlKey &&
      (
        key === "s" ||
        key === "p"
      )
    ) {
      event.preventDefault();

      alert(
        "Downloading and printing are disabled for this PDF."
      );
    }
  }
);