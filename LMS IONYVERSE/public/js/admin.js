/*
  ADMIN FIREBASE FUNCTIONS WILL GO HERE.

  Next functions to implement:

  1. Firebase admin login
  2. Admin logout
  3. Register students
  4. Suspend students
  5. Remove students
  6. Upload PDFs
  7. Add video links
  8. Approve PDF requests
  9. Approve consultation requests
  10. Load dashboard statistics

  The current prototype admin login remains available
  through common.js until Firebase is connected.
*/


// document.addEventListener("DOMContentLoaded", function () {
//   const role = sessionStorage.getItem("lmsRole");

//   if (role !== "admin") {
//     window.location.href = "./login.html";
//     return;
//   }

//   const loginGate = document.getElementById("admin-login-gate");
//   const dashboard = document.getElementById("admin-dashboard");

//   if (loginGate) {
//     loginGate.style.display = "none";
//   }

//   if (dashboard) {
//     dashboard.style.display = "block";
//   }
// });

// window.adminLogout = function () {
//   sessionStorage.removeItem("lmsRole");
//   window.location.href = "./login.html";
// };




window.adminLogout = function () {
  sessionStorage.removeItem("lmsRole");
  window.location.href = "./login.html";
};


/* ------------------------------------------------------
   CREATE INTERNAL ADMIN PAGES
------------------------------------------------------ */

function createAdminPages() {
  const adminMain = document.querySelector(".admin-main");

  if (!adminMain) {
    console.error("Admin main area was not found.");
    return;
  }

  /*
    Keep your existing dashboard content.
    Move it into its own dashboard panel.
  */

  const oldContent = Array.from(adminMain.childNodes);

  const dashboardPanel = document.createElement("section");
  dashboardPanel.id = "admin-panel-dashboard";
  dashboardPanel.className = "admin-panel active";

  oldContent.forEach(function (item) {
    dashboardPanel.appendChild(item);
  });

  adminMain.appendChild(dashboardPanel);

  /*
    Add the new internal pages.
  */

  adminMain.insertAdjacentHTML(
    "beforeend",
    `
    <!-- ==========================================
         UPLOAD VIDEO PAGE
    =========================================== -->
    <section id="admin-panel-upload-video" class="admin-panel">

      <div class="section-head">
        <div class="page-title">Upload Video</div>
        <div class="page-subtitle">
          Add a new lesson video to the student library.
        </div>
      </div>

      <form id="admin-video-upload-form" class="admin-page-card">

        <div class="form-grid">

          <div class="form-group">
            <label class="form-label">Video Title</label>
            <input
              id="video-title"
              class="form-input"
              type="text"
              placeholder="Example: Integration Techniques — Part 01"
              required>
          </div>

          <div class="form-group">
            <label class="form-label">Subject</label>
            <select id="video-subject" class="form-select form-input">
              <option>Mathematics</option>
              <option>Physics</option>
              <option>Chemistry</option>
              <option>Biology</option>
              <option>English</option>
              <option>Economics</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Teacher</label>
            <input
              id="video-teacher"
              class="form-input"
              type="text"
              placeholder="Example: Mr. R. Perera"
              required>
          </div>

          <div class="form-group">
            <label class="form-label">Access Level</label>
            <select id="video-access" class="form-select form-input">
              <option value="free">Free — All Students</option>
              <option value="paid">Paid Students Only</option>
            </select>
          </div>

        </div>

        <div class="form-group" style="margin-bottom:20px">
          <label class="form-label">Video URL or Embed Link</label>
          <input
            id="video-url"
            class="form-input"
            type="url"
            placeholder="Paste the Cloudflare, YouTube, or Vimeo link"
            required>
        </div>

        <div class="form-group" style="margin-bottom:24px">
          <label class="form-label">Description</label>
          <textarea
            id="video-description"
            class="form-input"
            rows="5"
            placeholder="Enter a short lesson description"
            style="resize:vertical"></textarea>
        </div>

        <div class="admin-page-actions">
          <button type="submit" class="btn-large btn-yellow">
            Publish Video
          </button>

          <button
            type="button"
            class="btn-ghost btn-large"
            onclick="alert('Draft saved locally for testing.')">
            Save as Draft
          </button>
        </div>

      </form>
    </section>


    <!-- ==========================================
         VIDEOS PAGE
    =========================================== -->
    <section id="admin-panel-videos" class="admin-panel">

      <div class="section-head">
        <div class="page-title">Videos</div>
        <div class="page-subtitle">
          View, edit, or remove uploaded lesson videos.
        </div>
      </div>

      <div class="table-wrap">

        <div class="table-head-row">
          <div class="table-title">Video Library</div>

          <input
            class="table-search"
            type="text"
            placeholder="Search videos...">
        </div>

        <table>
          <thead>
            <tr>
              <th>Video</th>
              <th>Subject</th>
              <th>Teacher</th>
              <th>Access</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Advanced Integration Techniques</td>
              <td>Mathematics</td>
              <td>Mr. R. Perera</td>
              <td>Paid</td>
              <td>
                <span class="badge badge-green">Published</span>
              </td>
              <td>
                <div class="action-row">
                  <button class="act-btn" data-action="edit-video">
                    Edit
                  </button>                  
                  <button class="act-btn danger" data-action="remove">
                    Remove
                  </button>
                </div>
              </td>
            </tr>

            <tr>
              <td>Waves and Oscillations</td>
              <td>Physics</td>
              <td>Ms. N. Silva</td>
              <td>Free</td>
              <td>
                <span class="badge badge-green">Published</span>
              </td>
              <td>
                <div class="action-row">
                  <button class="act-btn" data-action="edit-video">
                    Edit
                  </button>                  
                  <button class="act-btn danger" data-action="remove">
                    Remove
                  </button>
                </div>
              </td>
            </tr>

            <tr>
              <td>Organic Chemistry Reactions</td>
              <td>Chemistry</td>
              <td>Mr. D. Fernando</td>
              <td>Paid</td>
              <td>
                <span class="badge badge-yellow">Draft</span>
              </td>
              <td>
                <div class="action-row">
                  <button class="act-btn" data-action="edit-video">
                    Edit
                  </button>                  
                  <button class="act-btn danger" data-action="remove">
                    Remove
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

      </div>
    </section>


    <!-- ==========================================
         PDF PAGE
    =========================================== -->
    <section id="admin-panel-pdfs" class="admin-panel">

      <div class="section-head">
        <div class="page-title">PDF Resources</div>
        <div class="page-subtitle">
          Upload learning materials and manage available PDF files.
        </div>
      </div>

      <form id="admin-pdf-upload-form" class="admin-page-card">

        <div class="db-recent">Upload New PDF</div>

        <div class="form-grid">

          <div class="form-group">
            <label class="form-label">PDF Title</label>
            <input
              id="pdf-title"
              class="form-input"
              type="text"
              placeholder="Example: Integration Revision Notes"
              required>
          </div>

          <div class="form-group">
            <label class="form-label">Subject</label>
            <select id="pdf-subject" class="form-select form-input">
              <option>Mathematics</option>
              <option>Physics</option>
              <option>Chemistry</option>
              <option>Biology</option>
              <option>English</option>
              <option>Economics</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Teacher</label>
            <input
              id="pdf-teacher"
              class="form-input"
              type="text"
              placeholder="Example: Mr. R. Perera"
              required>
          </div>

          <div class="form-group">
            <label class="form-label">Approval Required</label>
            <select id="pdf-approval" class="form-select form-input">
              <option value="yes">Yes — Student Must Request Access</option>
              <option value="no">No — Available Immediately</option>
            </select>
          </div>

        </div>

        <div class="form-group" style="margin-bottom:24px">
          <label class="form-label">Choose PDF File</label>

          <input
            id="pdf-file"
            class="admin-file-input"
            type="file"
            accept="application/pdf"
            required>
        </div>

        <button type="submit" class="btn-large btn-yellow">
          Upload PDF
        </button>

      </form>


      <div class="table-wrap">

        <div class="table-head-row">
          <div class="table-title">Uploaded PDF Files</div>

          <input
            class="table-search"
            type="text"
            placeholder="Search PDFs...">
        </div>

        <table>
          <thead>
            <tr>
              <th>PDF Title</th>
              <th>Subject</th>
              <th>Teacher</th>
              <th>Access</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Integration Revision Notes</td>
              <td>Mathematics</td>
              <td>Mr. R. Perera</td>
              <td>Request Required</td>
              <td>
                <span class="badge badge-green">Active</span>
              </td>
              <td>
                <div class="action-row">
                  <button class="act-btn" data-action="edit-pdf">
                    Edit
                  </button>
                  <button class="act-btn danger" data-action="remove">
                    Remove
                  </button>
                </div>

              

              </td>
            </tr>

            <tr>
              <td>Physics Formula Sheet</td>
              <td>Physics</td>
              <td>Ms. N. Silva</td>
              <td>Open Access</td>
              <td>
                <span class="badge badge-green">Active</span>
              </td>
              <td>
                <div class="action-row">
                  <button class="act-btn" data-action="edit-pdf">
                    Edit
                  </button>
                  <button class="act-btn danger" data-action="remove">
                    Remove
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

      </div>
    </section>


    <!-- ==========================================
         PDF REQUESTS PAGE
    =========================================== -->
    <section id="admin-panel-pdf-requests" class="admin-panel">

      <div class="section-head">
        <div class="page-title">PDF Requests</div>
        <div class="page-subtitle">
          Review student PDF access requests.
        </div>
      </div>

      <div class="analytics-grid">

        <div class="ana-card">
          <div class="ana-label">Total Requests</div>
          <div class="ana-val">21</div>
        </div>

        <div class="ana-card">
          <div class="ana-label">Pending</div>
          <div class="ana-val">5</div>
        </div>

        <div class="ana-card">
          <div class="ana-label">Approved</div>
          <div class="ana-val">14</div>
        </div>

        <div class="ana-card">
          <div class="ana-label">Rejected</div>
          <div class="ana-val">2</div>
        </div>

      </div>

      <div class="table-wrap">

        <div class="table-head-row">
          <div class="table-title">Student PDF Requests</div>

          <input
            class="table-search"
            type="text"
            placeholder="Search requests...">
        </div>

        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>PDF Resource</th>
              <th>Subject</th>
              <th>Requested Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td>Sithara K.</td>
              <td>Integration Revision Notes</td>
              <td>Mathematics</td>
              <td>07 Jun 2026</td>
              <td>
                <span class="badge badge-yellow request-status">
                  Pending
                </span>
              </td>
              <td>
                <div class="action-row">
                  <button
                    class="act-btn"
                    data-action="approve"
                    style="color:var(--yellow)">
                    Approve
                  </button>

                  <button
                    class="act-btn danger"
                    data-action="reject">
                    Reject
                  </button>
                </div>
              </td>
            </tr>

            <tr>
              <td>Dilshan L.</td>
              <td>Physics Formula Sheet</td>
              <td>Physics</td>
              <td>06 Jun 2026</td>
              <td>
                <span class="badge badge-green request-status">
                  Approved
                </span>
              </td>
              <td>
                <div class="action-row">
                  <button class="act-btn" data-action="view-request">
                    View
                  </button>
                </div>
              </td>
            </tr>

          </tbody>
        </table>

      </div>
    </section>

    <!-- ==========================================
     ANALYTICS PAGE
=========================================== -->
<section id="admin-panel-analytics" class="admin-panel">

  <div class="section-head">
    <div class="page-title">Analytics</div>
    <div class="page-subtitle">
      Review platform activity and learning trends.
    </div>
  </div>

  <div class="analytics-grid">

    <div class="ana-card">
      <div class="ana-label">New Students</div>
      <div class="ana-val">124</div>
      <div class="ana-delta">+12% this month</div>
    </div>

    <div class="ana-card">
      <div class="ana-label">Course Views</div>
      <div class="ana-val">3,842</div>
      <div class="ana-delta">+8% this week</div>
    </div>

    <div class="ana-card">
      <div class="ana-label">Consultations</div>
      <div class="ana-val">34</div>
      <div class="ana-delta">12 pending review</div>
    </div>

    <div class="ana-card">
      <div class="ana-label">PDF Requests</div>
      <div class="ana-val">21</div>
      <div class="ana-delta">5 awaiting approval</div>
    </div>

  </div>

  <div class="two-col">

    <div class="admin-page-card">
      <div class="db-recent">Monthly Enrollments</div>

      <div class="analytics-chart-wrap">
        <canvas id="monthly-enrollments-chart"></canvas>
      </div>
    </div>

    <div class="admin-page-card">
      <div class="db-recent">Top Subjects</div>

      <div class="db-course-row">
        <div class="db-course-name">Mathematics</div>
        <div class="db-prog-wrap">
          <div class="db-prog-bar">
            <div class="db-prog-fill" style="width:85%"></div>
          </div>
        </div>
      </div>

      <div class="db-course-row">
        <div class="db-course-name">Physics</div>
        <div class="db-prog-wrap">
          <div class="db-prog-bar">
            <div class="db-prog-fill" style="width:72%"></div>
          </div>
        </div>
      </div>

      <div class="db-course-row">
        <div class="db-course-name">Chemistry</div>
        <div class="db-prog-wrap">
          <div class="db-prog-bar">
            <div class="db-prog-fill" style="width:63%"></div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>


<!-- ==========================================
     STUDENTS PAGE
=========================================== -->
<section id="admin-panel-students" class="admin-panel">

  <div class="section-head">
    <div class="page-title">Students</div>
    <div class="page-subtitle">
      Register, edit, suspend, or remove student accounts.
    </div>
  </div>

  <div class="admin-page-card">

    <div class="db-recent">Register Student</div>

    <form id="admin-student-form">

      <div class="form-grid">

        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input
            class="form-input"
            type="text"
            placeholder="Student full name"
            required>
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            class="form-input"
            type="email"
            placeholder="student@email.com"
            required>
        </div>

        <div class="form-group">
          <label class="form-label">Username</label>
          <input
            class="form-input"
            type="text"
            placeholder="student username"
            required>
        </div>

        <div class="form-group">
          <label class="form-label">Temporary Password</label>
          <input
            class="form-input"
            type="password"
            placeholder="temporary password"
            required>
        </div>

      </div>

      <button type="submit" class="btn-large btn-yellow">
        Register Student
      </button>

    </form>
  </div>

  <div class="table-wrap">

    <div class="table-head-row">
      <div class="table-title">Student Management</div>

      <input
        class="table-search"
        type="text"
        placeholder="Search students...">
    </div>

    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Courses</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>

        <tr>
          <td>Sithara K.</td>
          <td>sithara@email.com</td>
          <td>4</td>
          <td>
            <span class="badge badge-green">Active</span>
          </td>
          <td>
            <div class="action-row">
              <button class="act-btn" data-action="view-student">
                View
              </button>

              <button class="act-btn" data-action="edit-student">
                Edit
              </button>

              <button class="act-btn danger" data-action="remove">
                Remove
              </button>
            </div>
          </td>
        </tr>

        <tr>
          <td>Dilshan L.</td>
          <td>dilshan@email.com</td>
          <td>3</td>
          <td>
            <span class="badge badge-yellow">Suspended</span>
          </td>
          <td>
            <div class="action-row">
              <button class="act-btn" data-action="view-student">
                View
              </button>

              <button class="act-btn" data-action="edit-student">
                Edit
              </button>

              <button class="act-btn danger" data-action="remove">
                Remove
              </button>
            </div>
          </td>
        </tr>

      </tbody>
    </table>
  </div>
</section>


<!-- ==========================================
     TEACHERS PAGE
=========================================== -->
<section id="admin-panel-teachers" class="admin-panel">

  <div class="section-head">
    <div class="page-title">Teachers</div>
    <div class="page-subtitle">
      View and manage teacher records.
    </div>
  </div>

  <div class="table-wrap">

    <div class="table-head-row">
      <div class="table-title">Teacher Directory</div>

      <input
        class="table-search"
        type="text"
        placeholder="Search teachers...">
    </div>

    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Subject</th>
          <th>Experience</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>

        <tr>
          <td>Mr. R. Perera</td>
          <td>Mathematics</td>
          <td>8 years</td>
          <td>
            <span class="badge badge-green">Active</span>
          </td>
          <td>
            <div class="action-row">
              <button class="act-btn" data-action="view-teacher">
                View
              </button>

              <button class="act-btn" data-action="edit-teacher">
                Edit
              </button>

              <button class="act-btn danger" data-action="remove">
                Remove
              </button>
            </div>
          </td>
        </tr>

        <tr>
          <td>Ms. N. Silva</td>
          <td>Physics</td>
          <td>6 years</td>
          <td>
            <span class="badge badge-green">Active</span>
          </td>
          <td>
            <div class="action-row">
              <button class="act-btn" data-action="view-teacher">
                View
              </button>

              <button class="act-btn" data-action="edit-teacher">
                Edit
              </button>

              <button class="act-btn danger" data-action="remove">
                Remove
              </button>
            </div>
          </td>
        </tr>

      </tbody>
    </table>
  </div>
</section>


<!-- ==========================================
     CONSULTATIONS PAGE
=========================================== -->
<section id="admin-panel-consultations" class="admin-panel">

  <div class="section-head">
    <div class="page-title">Consultations</div>
    <div class="page-subtitle">
      Review and manage student consultation requests.
    </div>
  </div>

  <div class="analytics-grid">

    <div class="ana-card">
      <div class="ana-label">Total Requests</div>
      <div class="ana-val">34</div>
    </div>

    <div class="ana-card">
      <div class="ana-label">Pending</div>
      <div class="ana-val">12</div>
    </div>

    <div class="ana-card">
      <div class="ana-label">Approved</div>
      <div class="ana-val">18</div>
    </div>

    <div class="ana-card">
      <div class="ana-label">Rejected</div>
      <div class="ana-val">4</div>
    </div>

  </div>

  <div class="table-wrap">

    <div class="table-head-row">
      <div class="table-title">Consultation Requests</div>

      <input
        class="table-search"
        type="text"
        placeholder="Search consultations...">
    </div>

    <table>
      <thead>
        <tr>
          <th>Student</th>
          <th>Subject</th>
          <th>Requested Date</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>

        <tr>
          <td>Sithara K.</td>
          <td>Physics Preparation</td>
          <td>09 Jun 2026</td>
          <td>
            <span class="badge badge-yellow consult-status">
              Pending
            </span>
          </td>
          <td>
            <div class="action-row">

              <button
                class="act-btn"
                data-action="view-consultation">
                View
              </button>

              <button
                class="act-btn"
                data-action="approve-consultation">
                Approve
              </button>

              <button
                class="act-btn danger"
                data-action="reject-consultation">
                Reject
              </button>

            </div>
          </td>
        </tr>

        <tr>
          <td>Amara M.</td>
          <td>Chemistry Revision</td>
          <td>10 Jun 2026</td>
          <td>
            <span class="badge badge-green consult-status">
              Approved
            </span>
          </td>
          <td>
            <div class="action-row">
              <button
                class="act-btn"
                data-action="view-consultation">
                View
              </button>
            </div>
          </td>
        </tr>

      </tbody>
    </table>
  </div>
</section>


<!-- ==========================================
     NOTIFICATIONS PAGE
=========================================== -->
<section id="admin-panel-notifications" class="admin-panel">

  <div class="section-head">
    <div class="page-title">Notifications</div>
    <div class="page-subtitle">
      Send announcements and manage recent notifications.
    </div>
  </div>

  <div class="admin-page-card">

    <div class="db-recent">Create Notification</div>

    <form id="admin-notification-form">

      <div class="form-group" style="margin-bottom:18px">
        <label class="form-label">Title</label>

        <input
          class="form-input"
          type="text"
          placeholder="Example: New Physics Lesson Uploaded"
          required>
      </div>

      <div class="form-group" style="margin-bottom:18px">
        <label class="form-label">Message</label>

        <textarea
          class="form-input"
          rows="5"
          placeholder="Write the notification message..."
          style="resize:vertical"
          required></textarea>
      </div>

      <button type="submit" class="btn-large btn-yellow">
        Send Notification
      </button>

    </form>
  </div>

  <div class="table-wrap">

    <div class="table-head-row">
      <div class="table-title">Recent Notifications</div>

      <input
        class="table-search"
        type="text"
        placeholder="Search notifications...">
    </div>

    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Audience</th>
          <th>Sent Date</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>

        <tr>
          <td>New Physics Lesson Uploaded</td>
          <td>All Students</td>
          <td>07 Jun 2026</td>
          <td>
            <span class="badge badge-green">Sent</span>
          </td>
          <td>
            <div class="action-row">

              <button
                class="act-btn"
                data-action="view-notification">
                View
              </button>

              <button
                class="act-btn danger"
                data-action="remove">
                Remove
              </button>

            </div>
          </td>
        </tr>

      </tbody>
    </table>
  </div>
</section>

    `
  );

  connectAdminPageForms();
}


/* ------------------------------------------------------
   CONNECT LEFT SIDEBAR
------------------------------------------------------ */

function connectAdminSidebar() {
  const sidebarItems = document.querySelectorAll(".admin-nav-item");

  sidebarItems.forEach(function (item) {
    const text = item.textContent.trim().toLowerCase();

    if (text.includes("dashboard")) {
      item.addEventListener("click", function () {
        showAdminPanel("dashboard", item);
      });
    }

    if (text.includes("analytics")) {
      item.addEventListener("click", function () {
        showAdminPanel("analytics", item);
      });
    }

    if (text.includes("students")) {
      item.addEventListener("click", function () {
        showAdminPanel("students", item);
      });
    }

    if (text.includes("teachers")) {
      item.addEventListener("click", function () {
        showAdminPanel("teachers", item);
      });
    }

    if (text.includes("upload video")) {
      item.addEventListener("click", function () {
        showAdminPanel("upload-video", item);
      });
    }

    if (text.includes("videos") && !text.includes("upload")) {
      item.addEventListener("click", function () {
        showAdminPanel("videos", item);
      });
    }

    if (text.includes("pdf requests")) {
      item.addEventListener("click", function () {
        showAdminPanel("pdf-requests", item);
      });
    }

    if (text.includes("pdfs") && !text.includes("requests")) {
      item.addEventListener("click", function () {
        showAdminPanel("pdfs", item);
      });
    }

    if (text.includes("consultations")) {
      item.addEventListener("click", function () {
        showAdminPanel("consultations", item);
      });
    }

    if (text.includes("notifications")) {
      item.addEventListener("click", function () {
        showAdminPanel("notifications", item);
      });
    }

    if (text.includes("banner advertisements")) {
      item.addEventListener("click", function () {
        showAdminPanel("banners", item);
      });
    }

  });
}


function showAdminPanel(panelName, selectedSidebarItem) {
  document.querySelectorAll(".admin-panel").forEach(function (panel) {
    panel.classList.remove("active");
  });

  const selectedPanel = document.getElementById(
    "admin-panel-" + panelName
  );

  if (!selectedPanel) {
    console.error("Admin page was not found:", panelName);
    return;
  }

  selectedPanel.classList.add("active");
    if (panelName === "dashboard") {
  setTimeout(function () {
    initializeDashboardChart();
  }, 50);
}

    if (panelName === "analytics") {
        setTimeout(function () {
        initializeAnalyticsChart();
        }, 50);
  }
  
  document.querySelectorAll(".admin-nav-item").forEach(function (item) {
    item.classList.remove("active");
  });

  selectedSidebarItem.classList.add("active");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* ------------------------------------------------------
   TEMPORARY VISUAL TEST ACTIONS
   Firebase will replace these later.
------------------------------------------------------ */

function connectAdminPageForms() {
  const videoForm = document.getElementById(
    "admin-video-upload-form"
  );

  if (videoForm) {
    videoForm.addEventListener("submit", function (event) {
      event.preventDefault();

      alert(
        "Video published successfully for visual testing. Firebase will store it later."
      );

      videoForm.reset();
    });
  }


  const pdfForm = document.getElementById(
    "admin-pdf-upload-form"
  );

  if (pdfForm) {
    pdfForm.addEventListener("submit", function (event) {
      event.preventDefault();

      alert(
        "PDF uploaded successfully for visual testing. Firebase Storage will save it later."
      );

      pdfForm.reset();
    });
  }


  document.addEventListener("click", function (event) {
    const button = event.target.closest("[data-action]");

    if (!button) {
      return;
    }

    const action = button.dataset.action;
    const row = button.closest("tr");
    
    if (action === "edit-video") {
      openEditModal(row, "Edit Video");
    return;
    }

    if (action === "edit-pdf") {
      openEditModal(row, "Edit PDF Resource");
    return;
    }

    if (action === "view-pdf") {
      openViewModal(row, "PDF Resource Details");
    return;
    }

    if (action === "view-request") {
      openViewModal(row, "PDF Request Details");
    return;
    }

    if (!row) {
      return;
    }
    if (action === "view-student") {
  openViewModal(row, "Student Details");
  return;
}

if (action === "edit-student") {
  openEditModal(row, "Edit Student");
  return;
}

if (action === "view-teacher") {
  openViewModal(row, "Teacher Details");
  return;
}

if (action === "edit-teacher") {
  openEditModal(row, "Edit Teacher");
  return;
}

if (action === "view-consultation") {
  openViewModal(row, "Consultation Details");
  return;
}

if (action === "approve-consultation") {
  const statusBadge = row.querySelector(".consult-status");

  if (statusBadge) {
    statusBadge.textContent = "Approved";
    statusBadge.className =
      "badge badge-green consult-status";
  }

  alert("Consultation approved.");
  return;
}

if (action === "reject-consultation") {
  const statusBadge = row.querySelector(".consult-status");

  if (statusBadge) {
    statusBadge.textContent = "Rejected";
    statusBadge.className =
      "badge badge-red consult-status";
  }

  alert("Consultation rejected.");
  return;
}

if (action === "view-notification") {
  openViewModal(row, "Notification Details");
  return;
}

    if (action === "remove") {
      const confirmed = confirm(
        "Are you sure you want to remove this item?"
      );

      if (confirmed) {
        row.remove();
      }

      return;
    }


    const statusBadge = row.querySelector(".request-status");

    if (!statusBadge) {
      return;
    }

    if (action === "approve") {
      statusBadge.textContent = "Approved";
      statusBadge.className =
        "badge badge-green request-status";

      alert("PDF request approved.");
    }

    if (action === "reject") {
      statusBadge.textContent = "Rejected";
      statusBadge.className =
        "badge badge-red request-status";

      alert("PDF request rejected.");
    }
  });
  const studentForm = document.getElementById(
  "admin-student-form"
);

if (studentForm) {
  studentForm.addEventListener("submit", function (event) {
    event.preventDefault();

    alert(
      "Student registered successfully for local testing."
    );

    studentForm.reset();
  });
}


const notificationForm = document.getElementById(
  "admin-notification-form"
);

if (notificationForm) {
  notificationForm.addEventListener(
    "submit",
    function (event) {
      event.preventDefault();

      alert(
        "Notification sent successfully for local testing."
      );

      notificationForm.reset();
    }
  );
}
}

/* ======================================================
   ADMIN EDIT AND VIEW POPUPS
====================================================== */

let currentEditingRow = null;


/* Create popup once when needed */
function ensureAdminModalExists() {
  if (document.getElementById("admin-action-modal")) {
    return;
  }

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div id="admin-action-modal" class="admin-modal">

      <div class="admin-modal-box">

        <div class="admin-modal-head">

          <div
            id="admin-modal-title"
            class="admin-modal-title">
            Details
          </div>

          <button
            type="button"
            class="admin-modal-close"
            onclick="closeAdminModal()">
            ×
          </button>

        </div>

        <div id="admin-modal-content"></div>

      </div>
    </div>
    `
  );

  const modal = document.getElementById("admin-action-modal");

  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeAdminModal();
    }
  });
}


/* Close popup */
window.closeAdminModal = function () {
  const modal = document.getElementById("admin-action-modal");

  if (modal) {
    modal.classList.remove("open");
  }

  currentEditingRow = null;
};


/* Get table headings */
function getRowHeadings(row) {
  const table = row.closest("table");

  if (!table) {
    return [];
  }

  return Array.from(table.querySelectorAll("thead th"))
    .map(function (heading) {
      return heading.textContent.trim();
    });
}


/* View row information */
function openViewModal(row, title) {
  ensureAdminModalExists();

  const headings = getRowHeadings(row);
  const cells = Array.from(row.querySelectorAll("td"));

  const content = cells
    .map(function (cell, index) {
      const heading = headings[index] || "Details";

      if (heading.toLowerCase() === "actions") {
        return "";
      }

      return `
        <div class="admin-modal-row">
          <div class="admin-modal-key">
            ${escapeAdminHtml(heading)}
          </div>

          <div class="admin-modal-value">
            ${escapeAdminHtml(cell.textContent.trim())}
          </div>
        </div>
      `;
    })
    .join("");

  document.getElementById("admin-modal-title").textContent = title;

  document.getElementById("admin-modal-content").innerHTML = `
    ${content}

    <div style="margin-top:24px">
      <button
        type="button"
        class="btn-large btn-yellow"
        onclick="closeAdminModal()">
        Close
      </button>
    </div>
  `;

  document
    .getElementById("admin-action-modal")
    .classList
    .add("open");
}


/* Edit row information */
function openEditModal(row, title) {
  ensureAdminModalExists();

  currentEditingRow = row;

  const headings = getRowHeadings(row);
  const cells = Array.from(row.querySelectorAll("td"));

  const fields = cells
    .map(function (cell, index) {
      const heading = headings[index] || "Field";
      const headingLower = heading.toLowerCase();

      if (
        headingLower === "actions" ||
        headingLower === "status"
      ) {
        return "";
      }

      return `
        <div class="form-group admin-edit-field">

          <label class="form-label">
            ${escapeAdminHtml(heading)}
          </label>

          <input
            class="form-input admin-row-edit-input"
            type="text"
            data-cell-index="${index}"
            value="${escapeAdminHtml(cell.textContent.trim())}">

        </div>
      `;
    })
    .join("");

  document.getElementById("admin-modal-title").textContent = title;

  document.getElementById("admin-modal-content").innerHTML = `
    <form id="admin-row-edit-form">

      ${fields}

      <div class="admin-page-actions" style="margin-top:24px">

        <button type="submit" class="btn-large btn-yellow">
          Save Changes
        </button>

        <button
          type="button"
          class="btn-ghost btn-large"
          onclick="closeAdminModal()">
          Cancel
        </button>

      </div>

    </form>
  `;

  document
    .getElementById("admin-row-edit-form")
    .addEventListener("submit", saveAdminRowChanges);

  document
    .getElementById("admin-action-modal")
    .classList
    .add("open");
}


/* Save edited values into table */
function saveAdminRowChanges(event) {
  event.preventDefault();

  if (!currentEditingRow) {
    return;
  }

  const cells = Array.from(
    currentEditingRow.querySelectorAll("td")
  );

  document
    .querySelectorAll(".admin-row-edit-input")
    .forEach(function (input) {
      const index = Number(input.dataset.cellIndex);

      if (cells[index]) {
        cells[index].textContent = input.value.trim();
      }
    });

  closeAdminModal();

  alert("Changes saved successfully for local testing.");
}


/* Protect popup text */
function escapeAdminHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ======================================================
   MONTHLY ENROLLMENTS CHART
====================================================== */

let monthlyEnrollmentsChart = null;

function initializeAnalyticsChart() {
  const canvas = document.getElementById(
    "monthly-enrollments-chart"
  );

  if (!canvas) {
    return;
  }

  /*
    Avoid creating the same chart again whenever
    the admin clicks Analytics.
  */
  if (monthlyEnrollmentsChart) {
    return;
  }

  if (typeof Chart === "undefined") {
    console.error("Chart.js was not loaded.");
    return;
  }

  monthlyEnrollmentsChart = new Chart(canvas, {
    type: "bar",

    data: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul"
      ],

      datasets: [
        {
          label: "Student Enrollments",

          data: [
            68,
            92,
            81,
            118,
            104,
            146,
            132
          ],

          backgroundColor: [
            "rgba(240, 234, 214, 0.16)",
            "rgba(240, 234, 214, 0.16)",
            "rgba(240, 234, 214, 0.16)",
            "rgba(240, 234, 214, 0.16)",
            "rgba(240, 234, 214, 0.16)",
            "rgba(255, 212, 0, 0.58)",
            "rgba(240, 234, 214, 0.16)"
          ],

          borderColor: [
            "rgba(240, 234, 214, 0.20)",
            "rgba(240, 234, 214, 0.20)",
            "rgba(240, 234, 214, 0.20)",
            "rgba(240, 234, 214, 0.20)",
            "rgba(240, 234, 214, 0.20)",
            "rgba(255, 212, 0, 0.95)",
            "rgba(240, 234, 214, 0.20)"
          ],

          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 52
        }
      ]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      animation: {
        duration: 800
      },

      plugins: {
        legend: {
          display: false
        },

        tooltip: {
          displayColors: false,

          callbacks: {
            label: function (context) {
              return context.parsed.y + " students enrolled";
            }
          }
        }
      },

      scales: {
        x: {
          grid: {
            display: false
          },

          ticks: {
            color: "rgba(240, 234, 214, 0.55)",
            font: {
              family: "Space Mono",
              size: 11
            }
          }
        },

        y: {
          beginAtZero: true,

          grid: {
            color: "rgba(240, 234, 214, 0.08)"
          },

          ticks: {
            color: "rgba(240, 234, 214, 0.55)",
            font: {
              family: "Space Mono",
              size: 10
            }
          }
        }
      }
    }
  });
}

/* ======================================================
   DASHBOARD MONTHLY ENROLLMENTS CHART
====================================================== */

let dashboardEnrollmentsChart = null;

function initializeDashboardChart() {
  const canvas = document.getElementById(
    "dashboard-enrollments-chart"
  );

  if (!canvas) {
    return;
  }

  /*
    Prevent duplicate charts when the admin returns
    to the Dashboard page.
  */
  if (dashboardEnrollmentsChart) {
    return;
  }

  if (typeof Chart === "undefined") {
    console.error("Chart.js was not loaded.");
    return;
  }

  dashboardEnrollmentsChart = new Chart(canvas, {
    type: "bar",

    data: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug"
      ],

      datasets: [
        {
          label: "Student Enrollments",

          data: [
            68,
            92,
            81,
            118,
            104,
            146,
            128,
            154
          ],

          backgroundColor: [
            "rgba(240, 234, 214, 0.16)",
            "rgba(240, 234, 214, 0.16)",
            "rgba(240, 234, 214, 0.16)",
            "rgba(240, 234, 214, 0.16)",
            "rgba(240, 234, 214, 0.16)",
            "rgba(255, 212, 0, 0.58)",
            "rgba(240, 234, 214, 0.16)",
            "rgba(240, 234, 214, 0.16)"
          ],

          borderColor: [
            "rgba(240, 234, 214, 0.22)",
            "rgba(240, 234, 214, 0.22)",
            "rgba(240, 234, 214, 0.22)",
            "rgba(240, 234, 214, 0.22)",
            "rgba(240, 234, 214, 0.22)",
            "rgba(255, 212, 0, 0.95)",
            "rgba(240, 234, 214, 0.22)",
            "rgba(240, 234, 214, 0.22)"
          ],

          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 46
        }
      ]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      animation: {
        duration: 700
      },

      plugins: {
        legend: {
          display: false
        },

        tooltip: {
          displayColors: false,

          callbacks: {
            label: function (context) {
              return context.parsed.y + " students enrolled";
            }
          }
        }
      },

      scales: {
        x: {
          grid: {
            display: false
          },

          ticks: {
            color: "rgba(240, 234, 214, 0.55)",

            font: {
              family: "Space Mono",
              size: 10
            }
          }
        },

        y: {
          beginAtZero: true,

          grid: {
            color: "rgba(240, 234, 214, 0.08)"
          },

          ticks: {
            color: "rgba(240, 234, 214, 0.55)",

            font: {
              family: "Space Mono",
              size: 10
            }
          }
        }
      }
    }
  });
}

/* ======================================================
   EXISTING DASHBOARD FUNCTIONALITY
====================================================== */

function setupDashboardExtras() {
  const dashboard = document.getElementById(
    "admin-panel-dashboard"
  );

  if (!dashboard) {
    console.error("Dashboard panel was not found.");
    return;
  }

  removeOldDashboardUploadPanel(dashboard);
  setupDashboardTopCards(dashboard);
  setupRecentActivity(dashboard);
  setupDashboardTableButtons(dashboard);
}


/* ------------------------------------------------------
   REMOVE OLD UPLOAD VIDEO FORM FROM DASHBOARD

   The proper Upload Video page remains available from
   the left sidebar.
------------------------------------------------------ */

function removeOldDashboardUploadPanel(dashboard) {
  const headings = Array.from(
    dashboard.querySelectorAll(".db-recent")
  );

  const uploadHeading = headings.find(function (heading) {
    return heading.textContent.trim().toLowerCase() ===
      "upload video";
  });

  if (!uploadHeading) {
    return;
  }

  /*
    In the original dashboard, the heading and the upload
    form are inside the same outer wrapper.
  */

  const uploadWrapper = uploadHeading.parentElement;

  if (uploadWrapper) {
    uploadWrapper.remove();
  }
}


/* ------------------------------------------------------
   CLICKABLE DASHBOARD CARDS
------------------------------------------------------ */

function setupDashboardTopCards(dashboard) {
  const cards = dashboard.querySelectorAll(".ana-card");

  cards.forEach(function (card) {
    const label = card
      .querySelector(".ana-label")
      ?.textContent
      .trim()
      .toLowerCase() || "";

    let targetPage = "";

    if (label.includes("student")) {
      targetPage = "students";
    }

    if (label.includes("video")) {
      targetPage = "videos";
    }

    if (label.includes("consultation")) {
      targetPage = "consultations";
    }

    if (label.includes("pdf request")) {
      targetPage = "pdf-requests";
    }

    if (!targetPage) {
      return;
    }

    card.classList.add("dashboard-link-card");

    card.addEventListener("click", function () {
      openAdminSidebarPage(targetPage);
    });
  });
}


/* ------------------------------------------------------
   RECENT ACTIVITY SCROLL AND LINKS
------------------------------------------------------ */

function setupRecentActivity(dashboard) {
  const headings = Array.from(
    dashboard.querySelectorAll(".db-recent")
  );

  const recentHeading = headings.find(function (heading) {
    return heading.textContent.trim().toLowerCase() ===
      "recent activity";
  });

  if (!recentHeading) {
    return;
  }

  const recentList = recentHeading.nextElementSibling;

  if (!recentList) {
    return;
  }

  recentList.classList.add("dashboard-recent-list");

  const activityItems = Array.from(recentList.children);

  activityItems.forEach(function (item) {
    item.classList.add("dashboard-recent-item");

    const text = item.textContent.trim().toLowerCase();

    if (text.includes("pdf request")) {
      item.addEventListener("click", function () {
        openAdminSidebarPage("pdf-requests");
      });

      return;
    }

    if (text.includes("student enrolled")) {
      item.addEventListener("click", function () {
        openAdminSidebarPage("students");
      });

      return;
    }

    if (
      text.includes("consultation") ||
      text.includes("booked")
    ) {
      item.addEventListener("click", function () {
        openAdminSidebarPage("consultations");
      });
    }
  });
}


/* ------------------------------------------------------
   OPEN A PAGE USING THE EXISTING SIDEBAR

   Clicking cards or Recent Activity items now behaves
   exactly like clicking the matching left-sidebar item.
------------------------------------------------------ */

function openAdminSidebarPage(pageName) {
  const sidebarItems = Array.from(
    document.querySelectorAll(".admin-nav-item")
  );

  let sidebarItem = null;

  if (pageName === "students") {
    sidebarItem = sidebarItems.find(function (item) {
      return item.textContent
        .trim()
        .toLowerCase()
        .includes("students");
    });
  }

  if (pageName === "videos") {
    sidebarItem = sidebarItems.find(function (item) {
      const text = item.textContent.trim().toLowerCase();

      return text.includes("videos") &&
        !text.includes("upload");
    });
  }

  if (pageName === "consultations") {
    sidebarItem = sidebarItems.find(function (item) {
      return item.textContent
        .trim()
        .toLowerCase()
        .includes("consultations");
    });
  }

  if (pageName === "pdf-requests") {
    sidebarItem = sidebarItems.find(function (item) {
      return item.textContent
        .trim()
        .toLowerCase()
        .includes("pdf requests");
    });
  }

  if (sidebarItem) {
    sidebarItem.click();
  }
}


/* ------------------------------------------------------
   DASHBOARD TABLE BUTTONS
------------------------------------------------------ */

function setupDashboardTableButtons(dashboard) {
  dashboard.addEventListener("click", function (event) {
    const button = event.target.closest(".act-btn");

    if (!button) {
      return;
    }

    const row = button.closest("tr");

    if (!row) {
      return;
    }

    const action = button.textContent
      .trim()
      .toLowerCase();

    const tableWrapper = button.closest(".table-wrap");

    if (!tableWrapper) {
      return;
    }

    const internalTitle = tableWrapper
      .querySelector(".table-title")
      ?.textContent
      .trim()
      .toLowerCase() || "";

    const previousTitle = tableWrapper
      .previousElementSibling
      ?.textContent
      .trim()
      .toLowerCase() || "";

    const sectionTitle = internalTitle || previousTitle;


    /* ---------------- STUDENT MANAGEMENT ---------------- */

    if (sectionTitle.includes("student management")) {
      if (action === "edit") {
        if (typeof openEditModal === "function") {
          openEditModal(row, "Edit Student");
        } else {
          alert("Student edit popup will be connected here.");
        }

        return;
      }

      if (action === "deactivate") {
        updateStudentStatus(row, button, "inactive");
        return;
      }

      if (action === "activate") {
        updateStudentStatus(row, button, "active");
        return;
      }
    }


    /* ------------- CONSULTATION REQUESTS --------------- */

    if (sectionTitle.includes("consultation requests")) {
      if (action === "approve") {
        updateDashboardConsultationStatus(
          row,
          "approved"
        );

        return;
      }

      if (action === "reject") {
        updateDashboardConsultationStatus(
          row,
          "rejected"
        );

        return;
      }

      if (action === "notes") {
        openConsultationNotes(row);
      }
    }
  });
}


/* ------------------------------------------------------
   ACTIVATE OR DEACTIVATE STUDENT
------------------------------------------------------ */

function updateStudentStatus(row, button, newStatus) {
  const badge = row.querySelector(".badge");

  if (!badge) {
    return;
  }

  if (newStatus === "active") {
    badge.textContent = "Active";
    badge.className = "badge badge-green";

    button.textContent = "Deactivate";
    button.classList.add("danger");

    alert("Student account activated.");
    return;
  }

  badge.textContent = "Inactive";
  badge.className = "badge badge-gray";

  button.textContent = "Activate";
  button.classList.remove("danger");

  alert("Student account deactivated.");
}


/* ------------------------------------------------------
   APPROVE OR REJECT CONSULTATION
------------------------------------------------------ */

function updateDashboardConsultationStatus(
  row,
  newStatus
) {
  const badge = row.querySelector(".badge");

  if (!badge) {
    return;
  }

  const actionsArea = row.querySelector(".action-row");

  if (newStatus === "approved") {
    badge.textContent = "Approved";
    badge.className = "badge badge-green";

    if (actionsArea) {
      actionsArea.innerHTML = `
        <button class="act-btn">
          Notes
        </button>
      `;
    }

    alert("Consultation request approved.");
    return;
  }

  badge.textContent = "Rejected";
  badge.className = "badge badge-red";

  if (actionsArea) {
    actionsArea.innerHTML = `
      <button class="act-btn">
        Notes
      </button>
    `;
  }

  alert("Consultation request rejected.");
}


/* ------------------------------------------------------
   CONSULTATION NOTES
------------------------------------------------------ */

function openConsultationNotes(row) {
  const studentName =
    row.querySelector("td")?.textContent.trim() ||
    "Student";

  const existingNotes = row.dataset.notes || "";

  const notes = prompt(
    "Notes for " + studentName + ":",
    existingNotes
  );

  if (notes === null) {
    return;
  }

  row.dataset.notes = notes;

  alert("Consultation notes saved locally.");
}

/* ======================================================
   DASHBOARD CARD POINTER ANIMATION
====================================================== */

function setupDashboardCardMouseAnimation() {
  const cards = document.querySelectorAll(
    "#admin-panel-dashboard .ana-card"
  );

  console.log("Dashboard cards found:", cards.length);

  cards.forEach(function (card) {
    card.style.setProperty("cursor", "pointer", "important");

    card.style.setProperty(
      "transition",
      "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, background-image 0.15s ease",
      "important"
    );

    card.addEventListener("pointerenter", function () {
      card.style.setProperty(
        "transform",
        "translateY(-8px) scale(1.025)",
        "important"
      );

      card.style.setProperty(
        "border-color",
        "rgba(255, 212, 0, 0.95)",
        "important"
      );

      card.style.setProperty(
        "box-shadow",
        "0 16px 36px rgba(0,0,0,0.52), 0 0 22px rgba(255,212,0,0.22)",
        "important"
      );
    });

    card.addEventListener("pointermove", function (event) {
      const rect = card.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      card.style.setProperty(
        "background-image",
        `radial-gradient(
          circle 150px at ${x}px ${y}px,
          rgba(255, 212, 0, 0.22),
          rgba(255, 212, 0, 0.07) 38%,
          transparent 72%
        )`,
        "important"
      );
    });

    card.addEventListener("pointerleave", function () {
      card.style.removeProperty("transform");
      card.style.removeProperty("border-color");
      card.style.removeProperty("box-shadow");
      card.style.removeProperty("background-image");
    });

    card.addEventListener("pointerdown", function () {
      card.style.setProperty(
        "transform",
        "translateY(-3px) scale(0.98)",
        "important"
      );
    });

    card.addEventListener("pointerup", function () {
      card.style.setProperty(
        "transform",
        "translateY(-8px) scale(1.025)",
        "important"
      );
    });
  });
}

/* =========================================================
   ADMIN PANEL — TEACHER BANNER MANAGER
   ========================================================= */

function setupBannerManager() {
  const adminSidebar = document.querySelector(".admin-side");
  const adminMain = document.querySelector(".admin-main");

  if (!adminSidebar || !adminMain) return;

  if (document.getElementById("admin-panel-banners")) return;

  addBannerNavItem(adminSidebar);
  addBannerManagerPanel(adminMain);
  renderAdminBannerList();
}

function addBannerNavItem(adminSidebar) {
  const navigationGroups = adminSidebar.querySelectorAll(
    ".admin-nav-group"
  );

  const accountGroup =
    navigationGroups[navigationGroups.length - 1];

  const bannerMenu = document.createElement("div");

  bannerMenu.className = "admin-nav-group";

  bannerMenu.innerHTML = `
  <div class="admin-nav-label">
    Promotions
  </div>

  <div
    class="admin-nav-item"
    id="admin-nav-banners">

    <div class="admin-nav-dot"></div>

    🖼️ Banner Advertisements
  </div>
`;

  if (accountGroup) {
    accountGroup.insertAdjacentElement(
      "beforebegin",
      bannerMenu
    );
  } else {
    adminSidebar.appendChild(bannerMenu);
  }
}

function addBannerManagerPanel(adminMain) {
  const panel = document.createElement("section");

  panel.id = "admin-panel-banners";
  panel.className = "admin-panel";

  panel.innerHTML = `
  <div class="section-head banner-page-heading">

    <div>
      <div class="section-label">
        Promotions ✦
      </div>

      <div class="page-title">
        Banner Advertisements
      </div>

      <div class="page-subtitle">
        Upload, disable and remove teacher class banners.
        Active banners appear on the right side of the
        public Course Library.
      </div>
    </div>

    <div class="banner-page-status">
      <span class="banner-status-dot"></span>
      Course Library Ads
    </div>

  </div>


  <div class="banner-page-layout">

    <!-- LEFT: UPLOAD AREA -->
    <div class="banner-upload-card">

      <div class="banner-card-heading">
        <div>
          <div class="banner-card-title">
            Publish New Banner
          </div>

          <div class="banner-card-note">
            Add a vertical class advertisement image.
          </div>
        </div>

        <div class="banner-upload-icon">
          🖼️
        </div>
      </div>


      <form id="banner-upload-form">

        <div class="form-group banner-form-spacing">
          <label class="form-label">
            Advertisement Title
          </label>

          <input
            id="banner-title"
            class="form-input"
            type="text"
            placeholder="Example: A/L Biology Revision Class"
            maxlength="80"
            required>
        </div>


        <div class="form-group banner-form-spacing">
          <label class="form-label">
            Destination Link
          </label>

          <input
            id="banner-link"
            class="form-input"
            type="url"
            placeholder="Optional: https://wa.me/9477XXXXXXX">

          <div class="banner-input-note">
            Optional. Leave this empty when the image
            should not open a link.
          </div>
        </div>


        <div class="banner-image-upload-box">

          <label class="form-label">
            Banner Image
          </label>

          <input
            id="banner-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required>

          <div class="banner-image-guide">
            <strong>Recommended:</strong>
            720 × 900 px · JPG, PNG or WebP · Below 1 MB
          </div>

        </div>


        <div class="banner-publish-actions">

          <button
            class="btn-large btn-yellow"
            type="submit">
            Publish Banner
          </button>

          <button
            class="btn-large btn-outline"
            type="reset">
            Clear Form
          </button>

        </div>

      </form>

    </div>


    <!-- RIGHT: INFORMATION CARD -->
    <div class="banner-info-card">

      <div class="banner-info-icon">
        ✦
      </div>

      <div class="banner-info-title">
        Banner Placement
      </div>

      <p>
        Published banners appear vertically on the
        right-hand side of the Course Library.
      </p>

      <div class="banner-info-row">
        <span>Position</span>
        <strong>Right sidebar</strong>
      </div>

      <div class="banner-info-row">
        <span>Maximum banners</span>
        <strong>6</strong>
      </div>

      <div class="banner-info-row">
        <span>Link</span>
        <strong>Optional</strong>
      </div>

      <div class="banner-info-row">
        <span>Visibility</span>
        <strong>Active banners only</strong>
      </div>

    </div>

  </div>


  <!-- UPLOADED BANNERS -->
  <div class="banner-library-section">

    <div class="banner-library-head">

      <div>
        <div class="banner-card-title">
          Published Banners
        </div>

        <div class="banner-card-note">
          Manage advertisements currently stored in the system.
        </div>
      </div>

      <span class="pastel-pill pastel-pill-mint">
        Banner Library
      </span>

    </div>

    <div
      id="banner-admin-list"
      class="banner-admin-list">
    </div>

  </div>
`;

  adminMain.appendChild(panel);

  document
    .getElementById("banner-upload-form")
    .addEventListener("submit", handleBannerUpload);
}



function handleBannerUpload(event) {
  event.preventDefault();

  const title = document
    .getElementById("banner-title")
    .value
    .trim();

  const link = document
    .getElementById("banner-link")
    .value
    .trim();

  const imageFile = document
    .getElementById("banner-image")
    .files[0];

  if (!title || !imageFile) {
    alert("Please add a title and choose an image.");
    return;
  }

  if (imageFile.size > 1024 * 1024) {
    alert("Please choose an image smaller than 1 MB.");
    return;
  }

  const banners = window.getTeacherBanners();

  if (banners.length >= 6) {
    alert("A maximum of 6 banners is allowed.");
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    banners.push({
      id: Date.now().toString(),
      title: title,
      link: link,
      image: reader.result,
      active: true
    });

    window.saveTeacherBanners(banners);

    document
      .getElementById("banner-upload-form")
      .reset();

    renderAdminBannerList();

    alert("Banner published successfully.");
  };

  reader.onerror = function () {
    alert("The image could not be read.");
  };

  reader.readAsDataURL(imageFile);
}

function renderAdminBannerList() {
  const list = document.getElementById(
    "banner-admin-list"
  );

  if (!list) return;

  const banners = window.getTeacherBanners();

  if (banners.length === 0) {
    list.innerHTML = `
      <div class="teacher-banner-empty">
        No banners have been uploaded yet.
      </div>
    `;

    return;
  }

  list.innerHTML = banners.map((banner) => {
    const title = escapeAdminBannerText(
      banner.title || "Teacher Advertisement"
    );

    const statusText =
      banner.active === false ? "Enable" : "Disable";

    return `
      <article class="banner-admin-item">

        <img
          class="banner-admin-thumb"
          src="${banner.image}"
          alt="${title}">

        <div class="banner-admin-item-body">

          <div class="banner-admin-item-title">
            ${title}
          </div>

          <div class="banner-admin-item-actions">

            <button
              class="act-btn"
              onclick="toggleTeacherBanner('${banner.id}')">
              ${statusText}
            </button>

            <button
              class="act-btn danger"
              onclick="removeTeacherBanner('${banner.id}')">
              Remove
            </button>

          </div>

        </div>

      </article>
    `;
  }).join("");
}

function toggleTeacherBanner(id) {
  const banners = window.getTeacherBanners();

  const updated = banners.map((banner) => {
    if (banner.id === id) {
      return {
          ...banner,
          active: banner.active === false
      };
    }

    return banner;
  });

  window.saveTeacherBanners(updated);
  renderAdminBannerList();
}

function removeTeacherBanner(id) {
  const confirmed = confirm(
    "Remove this banner advertisement?"
  );

  if (!confirmed) return;

  const banners = window
    .getTeacherBanners()
    .filter((banner) => banner.id !== id);

  window.saveTeacherBanners(banners);
  renderAdminBannerList();
}

function escapeAdminBannerText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* Make onclick functions available globally */

window.toggleTeacherBanner = toggleTeacherBanner;
window.removeTeacherBanner = removeTeacherBanner;

/* ======================================================
   START ADMIN DASHBOARD
====================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const role = sessionStorage.getItem("lmsRole");

  if (role !== "admin") {
    window.location.href = "./login.html";
    return;
  }

  const loginGate = document.getElementById("admin-login-gate");
  const dashboard = document.getElementById("admin-dashboard");

  if (loginGate) {
    loginGate.style.display = "none";
  }

  if (dashboard) {
    dashboard.style.display = "block";
  }

  /*
    IMPORTANT ORDER:
    1. Create the normal pages
    2. Create the banner page and its sidebar button
    3. Connect sidebar clicks only after all sidebar buttons exist
  */

  if (typeof createAdminPages === "function") {
    createAdminPages();
  }

  if (typeof setupBannerManager === "function") {
    setupBannerManager();
  }

  if (typeof connectAdminSidebar === "function") {
    connectAdminSidebar();
  }

  if (typeof setupDashboardExtras === "function") {
    setupDashboardExtras();
  }

  if (typeof initializeDashboardChart === "function") {
    initializeDashboardChart();
  }

  if (typeof setupDashboardCardMouseAnimation === "function") {
    setupDashboardCardMouseAnimation();
  }

  console.log("Admin dashboard connected successfully.");
});