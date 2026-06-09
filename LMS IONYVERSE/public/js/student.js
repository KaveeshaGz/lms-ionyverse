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

  const labelMap = {
    "dashboard": "dashboard",
    "my-courses": "my courses",
    "videos": "videos",
    "pdf-library": "pdf library",
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

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};