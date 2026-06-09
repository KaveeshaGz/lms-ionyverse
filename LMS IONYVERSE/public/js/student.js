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


document.addEventListener("DOMContentLoaded", function () {
  const role = sessionStorage.getItem("lmsRole");

  if (role !== "student") {
    window.location.href = "./login.html";
    return;
  }

  const loginGate = document.getElementById("student-login-gate");
  const dashboard = document.getElementById("student-dashboard");

  if (loginGate) {
    loginGate.style.display = "none";
  }

  if (dashboard) {
    dashboard.style.display = "block";
  }

  createStudentPages();
  createStudentNotesPage();
  connectStudentSidebar();
  connectStudentDashboardRows();
  connectStudentButtons();

  console.log("Student dashboard connected.");
});


window.studentLogout = function () {
  sessionStorage.removeItem("lmsRole");
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
              class="form-input"
              type="text"
              placeholder="Example: Physics Formula Sheet"
              required>
          </div>

          <div class="form-group">
            <label class="form-label">
              Subject
            </label>

            <select class="form-select">
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

            <select class="form-select">
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
    pdfForm.addEventListener("submit", function (event) {
      event.preventDefault();

      alert("PDF request sent to the admin.");

      pdfForm.reset();
    });
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

     if (panelName === "study-notes") {
    window.renderStudentNotes("all");
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

      if (panelName === "study-notes") {
            renderStudentNotes("all");
      }

    });
    

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};

/* ======================================================
   STUDENT STUDY NOTES PAGE
   Temporary localStorage version.
   Firebase will replace this later.
====================================================== */

document.addEventListener("DOMContentLoaded", function () {
  /*
    Wait until the existing student pages are created.
  */
  setTimeout(function () {
    setupStudentNotesPage();
  }, 0);
});


function setupStudentNotesPage() {
  const sidebar = document.querySelector(
    "#student-dashboard .db-sidebar"
  );

  const content = document.querySelector(
    "#student-dashboard .db-content"
  );

  if (!sidebar || !content) {
    console.error("Student Notes area could not be created.");
    return;
  }

  /*
    Prevent duplicates after refreshing.
  */
  if (document.getElementById("student-panel-study-notes")) {
    return;
  }

  addStudentNotesSidebarItem(sidebar);
  addStudentNotesPanel(content);
  createStudentNoteModal();
  renderStudentNotes();

  console.log("Student Study Notes page connected.");
}


/* ------------------------------------------------------
   ADD SIDEBAR BUTTON
------------------------------------------------------ */

function addStudentNotesSidebarItem(sidebar) {
  const sidebarItems = Array.from(
    sidebar.querySelectorAll(".db-nav-item")
  );

  const pdfLibraryItem = sidebarItems.find(function (item) {
    return item.textContent
      .trim()
      .toLowerCase()
      .includes("pdf library");
  });

  const notesItem = document.createElement("div");

  notesItem.className = "db-nav-item";
  notesItem.innerHTML = "📝 Study Notes";

  notesItem.addEventListener("click", function () {
    showStudentNotesPanel(notesItem);
  });

  if (pdfLibraryItem) {
    pdfLibraryItem.insertAdjacentElement(
      "afterend",
      notesItem
    );
  } else {
    sidebar.appendChild(notesItem);
  }
}


/* ------------------------------------------------------
   CREATE STUDENT NOTES PAGE
------------------------------------------------------ */

function addStudentNotesPanel(content) {
  const panel = document.createElement("section");

  panel.id = "student-panel-study-notes";
  panel.className = "student-panel";

  panel.innerHTML = `
    <div class="section-head">

      <div class="section-label">
        Learning Resources ✦
      </div>

      <div class="page-title">
        Study Notes
      </div>

      <div class="page-subtitle">
        Browse visual revision notes published by your teachers.
        Open any note to view the full image.
      </div>

    </div>


    <div class="student-notes-toolbar">

      <div>
        <div class="student-notes-heading">
          Notes Library
        </div>

        <div class="student-notes-subheading">
          Quick revision cards, diagrams, and visual summaries.
        </div>
      </div>

      <select
        id="student-notes-filter"
        class="form-select student-notes-filter">

        <option value="all">
          All Subjects
        </option>

        <option value="mathematics">
          Mathematics
        </option>

        <option value="physics">
          Physics
        </option>

        <option value="chemistry">
          Chemistry
        </option>

        <option value="biology">
          Biology
        </option>

        <option value="english">
          English
        </option>

        <option value="economics">
          Economics
        </option>

        <option value="history">
          History
        </option>

        <option value="computer-science">
          Computer Science
        </option>

      </select>

    </div>


    <div
      id="student-notes-grid"
      class="student-notes-grid">
    </div>
  `;

  content.appendChild(panel);

  document
    .getElementById("student-notes-filter")
    .addEventListener("change", function () {
      renderStudentNotes(this.value);
    });
}


/* ------------------------------------------------------
   OPEN STUDENT NOTES PANEL
------------------------------------------------------ */

function showStudentNotesPanel(selectedItem) {
  document
    .querySelectorAll("#student-dashboard .student-panel")
    .forEach(function (panel) {
      panel.classList.remove("active");
    });

  const notesPanel = document.getElementById(
    "student-panel-study-notes"
  );

  if (!notesPanel) {
    return;
  }

  notesPanel.classList.add("active");

  document
    .querySelectorAll("#student-dashboard .db-nav-item")
    .forEach(function (item) {
      item.classList.remove("active");
    });

  selectedItem.classList.add("active");

  renderStudentNotes();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* ------------------------------------------------------
   READ PUBLISHED NOTES
------------------------------------------------------ */

function getStudentVisibleNotes() {
  try {
    const savedNotes = localStorage.getItem(
      "browseATeacherStudyNotes"
    );

    if (!savedNotes) {
      return [];
    }

    return JSON
      .parse(savedNotes)
      .filter(function (note) {
        return note.active !== false;
      });
  } catch (error) {
    console.error("Could not read student notes:", error);
    return [];
  }
}


/* ------------------------------------------------------
   DRAW NOTES CARDS
------------------------------------------------------ */

function renderStudentNotes(selectedSubject) {
  const grid = document.getElementById(
    "student-notes-grid"
  );

  if (!grid) {
    return;
  }

  const filterValue =
    selectedSubject ||
    document.getElementById("student-notes-filter")?.value ||
    "all";

  const notes = getStudentVisibleNotes()
    .filter(function (note) {
      return (
        filterValue === "all" ||
        note.subject === filterValue
      );
    });

  if (notes.length === 0) {
    grid.innerHTML = `
      <div class="student-notes-empty">
        <div class="student-notes-empty-icon">
          📝
        </div>

        <div class="student-notes-empty-title">
          No notes available yet
        </div>

        <div class="student-notes-empty-text">
          Published study notes will appear here.
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
      button.addEventListener("click", function () {
        const noteId = button.dataset.studentNoteId;

        const note = getStudentVisibleNotes()
          .find(function (item) {
            return item.id === noteId;
          });

        if (!note) {
          return;
        }

        openStudentNoteModal(note);
      });
    });
}


/* ------------------------------------------------------
   NOTE IMAGE MODAL
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
        closeStudentNoteModal();
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
   SAFE TEXT OUTPUT
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


/* Update student Notes page when storage changes */
window.addEventListener("storage", function (event) {
  if (event.key === "browseATeacherStudyNotes") {
    renderStudentNotes();
  }
});


if (text.includes("study notes")) {
  showStudentPanel("study-notes", item);
  renderStudentNotes();
  return;
}

/* ======================================================
   STUDENT STUDY NOTES
   Reads notes uploaded from the Admin Portal.
====================================================== */

window.renderStudentNotes = function (selectedSubject) {
  const grid = document.getElementById(
    "student-notes-grid"
  );

  if (!grid) {
    return;
  }

  let notes = [];

  try {
    notes = JSON.parse(
      localStorage.getItem(
        "browseATeacherStudyNotes"
      ) || "[]"
    );
  } catch (error) {
    console.error("Could not load study notes:", error);
  }

  notes = notes.filter(function (note) {
    const visible = note.active !== false;

    const correctSubject =
      selectedSubject === "all" ||
      !selectedSubject ||
      note.subject === selectedSubject;

    return visible && correctSubject;
  });

  if (notes.length === 0) {
    grid.innerHTML = `
      <div style="
        grid-column:1/-1;
        padding:40px 24px;
        text-align:center;
        border:1px dashed var(--ivory-border);
        border-radius:var(--radius);
        background:var(--card-bg);
        color:var(--ivory-dim);
      ">
        <div style="font-size:28px;margin-bottom:10px">
          📝
        </div>

        No published study notes are available yet.
      </div>
    `;

    return;
  }

  grid.innerHTML = notes
    .map(function (note) {
      return `
        <article class="note-card">

          <img
            class="note-image"
            src="${escapeStudentNoteText(note.imageUrl)}"
            alt="${escapeStudentNoteText(note.title)}">

          <div class="note-body">

            <div class="note-subject">
              ${escapeStudentNoteText(
                formatStudentNoteSubject(note.subject)
              )}
            </div>

            <div class="note-title">
              ${escapeStudentNoteText(note.title)}
            </div>

            <p class="note-description">
              ${escapeStudentNoteText(note.description)}
            </p>

            <button
              type="button"
              class="note-view-btn"
              onclick="openStudentNote(
                '${escapeStudentNoteText(note.id)}'
              )">
              View Note
            </button>

          </div>

        </article>
      `;
    })
    .join("");
};


window.openStudentNote = function (noteId) {
  let notes = [];

  try {
    notes = JSON.parse(
      localStorage.getItem(
        "browseATeacherStudyNotes"
      ) || "[]"
    );
  } catch (error) {
    console.error("Could not load study notes:", error);
  }

  const note = notes.find(function (item) {
    return item.id === noteId;
  });

  if (!note) {
    alert("The note could not be found.");
    return;
  }

  window.open(note.imageUrl, "_blank");
};


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

/* ======================================================
   STUDENT STUDY NOTES PAGE FIX
   Temporary localStorage version
====================================================== */

function ensureStudentNotesPanelExists() {
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


      <div style="
        display:flex;
        align-items:center;
        justify-content:space-between;
        flex-wrap:wrap;
        gap:16px;
        margin-bottom:24px;
        padding:18px 20px;
        border:1px solid var(--ivory-border);
        border-radius:var(--radius);
        background:var(--card-bg);
      ">

        <div>
          <div style="
            color:var(--ivory);
            font-family:var(--serif);
            font-size:22px;
          ">
            Notes Library
          </div>

          <div style="
            color:var(--ivory-dim);
            font-size:12px;
            margin-top:3px;
          ">
            Open any note to view the full-size image.
          </div>
        </div>


        <select
          id="student-notes-filter"
          class="form-select"
          style="width:190px"
          onchange="renderStudentNotes(this.value)">

          <option value="all">
            All Subjects
          </option>

          <option value="mathematics">
            Mathematics
          </option>

          <option value="physics">
            Physics
          </option>

          <option value="chemistry">
            Chemistry
          </option>

          <option value="biology">
            Biology
          </option>

          <option value="english">
            English
          </option>

          <option value="economics">
            Economics
          </option>

          <option value="history">
            History
          </option>

          <option value="computer-science">
            Computer Science
          </option>

        </select>

      </div>


      <div
        id="student-notes-grid"
        class="notes-grid">
      </div>

    </section>
    `
  );
}


/* ------------------------------------------------------
   READ AND DISPLAY PUBLISHED NOTES
------------------------------------------------------ */

window.renderStudentNotes = function (selectedSubject) {
  ensureStudentNotesPanelExists();

  const grid = document.getElementById(
    "student-notes-grid"
  );

  if (!grid) {
    return;
  }

  let notes = [];

  try {
    notes = JSON.parse(
      localStorage.getItem(
        "browseATeacherStudyNotes"
      ) || "[]"
    );
  } catch (error) {
    console.error("Could not load study notes:", error);
  }

  const subject = selectedSubject || "all";

  notes = notes.filter(function (note) {
    const isPublished = note.active !== false;

    const matchesSubject =
      subject === "all" ||
      note.subject === subject;

    return isPublished && matchesSubject;
  });

  if (notes.length === 0) {
    grid.innerHTML = `
      <div style="
        grid-column:1/-1;
        padding:44px 24px;
        text-align:center;
        border:1px dashed var(--ivory-border);
        border-radius:var(--radius);
        background:var(--card-bg);
        color:var(--ivory-dim);
      ">

        <div style="
          font-size:30px;
          margin-bottom:10px;
        ">
          📝
        </div>

        <div style="
          color:var(--ivory);
          font-family:var(--serif);
          font-size:20px;
          margin-bottom:5px;
        ">
          No study notes available yet
        </div>

        <div style="
          font-size:12px;
        ">
          Published notes will appear here.
        </div>

      </div>
    `;

    return;
  }

  grid.innerHTML = notes
    .map(function (note) {
      return `
        <article class="note-card">

          <img
            class="note-image"
            src="${escapeStudentNoteText(note.imageUrl)}"
            alt="${escapeStudentNoteText(note.title)}">

          <div class="note-body">

            <div class="note-subject">
              ${escapeStudentNoteText(
                formatStudentNoteSubject(note.subject)
              )}
            </div>

            <div class="note-title">
              ${escapeStudentNoteText(note.title)}
            </div>

            <p class="note-description">
              ${escapeStudentNoteText(note.description)}
            </p>

            <button
              type="button"
              class="note-view-btn"
              onclick="openStudentStudyNote(
                '${escapeStudentNoteText(note.id)}'
              )">
              View Note
            </button>

          </div>

        </article>
      `;
    })
    .join("");
};


/* ------------------------------------------------------
   OPEN FULL NOTE IMAGE
------------------------------------------------------ */

window.openStudentStudyNote = function (noteId) {
  let notes = [];

  try {
    notes = JSON.parse(
      localStorage.getItem(
        "browseATeacherStudyNotes"
      ) || "[]"
    );
  } catch (error) {
    console.error("Could not load study notes:", error);
  }

  const note = notes.find(function (item) {
    return item.id === noteId;
  });

  if (!note) {
    alert("The study note could not be found.");
    return;
  }

  window.open(note.imageUrl, "_blank");
};


/* ------------------------------------------------------
   SAFE TEXT OUTPUT
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


/* ------------------------------------------------------
   EXTEND THE EXISTING STUDENT NAVIGATION
------------------------------------------------------ */

const originalOpenStudentPanel =
  window.openStudentPanel;

window.openStudentPanel = function (panelName) {
  if (panelName === "study-notes") {
    ensureStudentNotesPanelExists();

    document
      .querySelectorAll(
        "#student-dashboard .student-panel"
      )
      .forEach(function (panel) {
        panel.classList.remove("active");
      });

    const notesPanel = document.getElementById(
      "student-panel-study-notes"
    );

    if (notesPanel) {
      notesPanel.classList.add("active");
    }

    document
      .querySelectorAll(
        "#student-dashboard .db-nav-item"
      )
      .forEach(function (item) {
        item.classList.remove("active");

        if (
          item.textContent
            .trim()
            .toLowerCase()
            .includes("study notes")
        ) {
          item.classList.add("active");
        }
      });

    window.renderStudentNotes("all");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    return;
  }

  originalOpenStudentPanel(panelName);
};


/* Create the Notes panel when the dashboard loads */
document.addEventListener(
  "DOMContentLoaded",
  function () {
    ensureStudentNotesPanelExists();
  }
);

/* ======================================================
   STUDENT STUDY NOTES PAGE
   Temporary localStorage version
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


      <div style="
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:16px;
        flex-wrap:wrap;
        margin-bottom:24px;
        padding:18px 20px;
        border:1px solid var(--ivory-border);
        border-radius:var(--radius);
        background:var(--card-bg);
      ">

        <div>
          <div style="
            color:var(--ivory);
            font-family:var(--serif);
            font-size:22px;
          ">
            Notes Library
          </div>

          <div style="
            color:var(--ivory-dim);
            font-size:12px;
            margin-top:3px;
          ">
            Open any note to view the full-size image.
          </div>
        </div>


        <select
          id="student-notes-filter"
          class="form-select"
          style="width:190px"
          onchange="renderStudentNotes(this.value)">

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
        class="notes-grid">
      </div>

    </section>
    `
  );

  window.renderStudentNotes("all");
}


/* ------------------------------------------------------
   DISPLAY PUBLISHED NOTES
------------------------------------------------------ */

window.renderStudentNotes = function (selectedSubject) {
  const grid = document.getElementById(
    "student-notes-grid"
  );

  if (!grid) {
    return;
  }

  let notes = [];

  try {
    notes = JSON.parse(
      localStorage.getItem(
        "browseATeacherStudyNotes"
      ) || "[]"
    );
  } catch (error) {
    console.error("Could not load study notes:", error);
  }

  const subject = selectedSubject || "all";

  notes = notes.filter(function (note) {
    return (
      note.active !== false &&
      (
        subject === "all" ||
        note.subject === subject
      )
    );
  });

  if (notes.length === 0) {
    grid.innerHTML = `
      <div style="
        grid-column:1/-1;
        padding:44px 24px;
        text-align:center;
        border:1px dashed var(--ivory-border);
        border-radius:var(--radius);
        background:var(--card-bg);
        color:var(--ivory-dim);
      ">
        <div style="
          font-size:30px;
          margin-bottom:10px;
        ">
          📝
        </div>

        <div style="
          color:var(--ivory);
          font-family:var(--serif);
          font-size:20px;
          margin-bottom:5px;
        ">
          No study notes available yet
        </div>

        <div style="font-size:12px">
          Published notes will appear here.
        </div>
      </div>
    `;

    return;
  }

  grid.innerHTML = notes
    .map(function (note) {
      return `
        <article class="note-card">

          <img
            class="note-image"
            src="${escapeStudentNoteText(note.imageUrl)}"
            alt="${escapeStudentNoteText(note.title)}">

          <div class="note-body">

            <div class="note-subject">
              ${escapeStudentNoteText(
                formatStudentNoteSubject(note.subject)
              )}
            </div>

            <div class="note-title">
              ${escapeStudentNoteText(note.title)}
            </div>

            <p class="note-description">
              ${escapeStudentNoteText(note.description)}
            </p>

            <button
              type="button"
              class="note-view-btn"
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
      button.addEventListener("click", function () {
        window.openStudentStudyNote(
          button.dataset.studentNoteId
        );
      });
    });
};


/* ------------------------------------------------------
   OPEN FULL NOTE IMAGE
------------------------------------------------------ */

window.openStudentStudyNote = function (noteId) {
  let notes = [];

  try {
    notes = JSON.parse(
      localStorage.getItem(
        "browseATeacherStudyNotes"
      ) || "[]"
    );
  } catch (error) {
    console.error("Could not load study notes:", error);
  }

  const note = notes.find(function (item) {
    return item.id === noteId;
  });

  if (!note) {
    alert("The study note could not be found.");
    return;
  }

  window.open(note.imageUrl, "_blank");
};


/* ------------------------------------------------------
   SAFE TEXT OUTPUT
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