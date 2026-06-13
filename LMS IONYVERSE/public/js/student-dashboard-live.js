/* ======================================================
   LIVE FIREBASE STUDENT DASHBOARD
====================================================== */

import {
  auth,
  db
} from "./firebase-config.js";


import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";


import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";


/* ======================================================
   LIVE DASHBOARD STATE
====================================================== */

const studentDashboardState = {
  user:
    null,

  profile:
    null,

  enrollments:
    [],

  progress:
    [],

  videos:
    [],

  pdfRequests:
    [],

  consultations:
    [],

  announcements:
    []
};


let dashboardUnsubscribers =
  [];


/* ------------------------------------------------------
   REMOVE OLD FIRESTORE LISTENERS
------------------------------------------------------ */

function clearStudentDashboardListeners() {
  dashboardUnsubscribers.forEach(
    function (unsubscribe) {
      try {
        unsubscribe();
      } catch (error) {
        console.warn(
          "Dashboard listener cleanup warning:",
          error
        );
      }
    }
  );


  dashboardUnsubscribers =
    [];
}


/* ------------------------------------------------------
   START DASHBOARD AFTER LOGIN
------------------------------------------------------ */

onAuthStateChanged(
  auth,

  function (user) {
    clearStudentDashboardListeners();


    if (!user) {
      return;
    }


    studentDashboardState.user =
      user;


    connectStudentProfile(
      user.uid
    );


    connectStudentEnrollments(
      user.uid
    );


    connectStudentProgress(
      user.uid
    );


    connectPublishedVideos();


    connectStudentPdfRequests(
      user.uid
    );


    connectStudentConsultations(
      user.uid
    );


    connectStudentAnnouncements();


    renderStudentDashboard();
  }
);


/* ======================================================
   FIRESTORE LIVE LISTENERS
====================================================== */

/* ------------------------------------------------------
   STUDENT PROFILE
------------------------------------------------------ */

function connectStudentProfile(
  studentUid
) {
  const unsubscribe =
    onSnapshot(
      doc(
        db,
        "users",
        studentUid
      ),

      function (snapshot) {
        studentDashboardState.profile =
          snapshot.exists()
            ? snapshot.data()
            : null;


        renderStudentDashboardName();
      },

      function (error) {
        console.error(
          "Student profile dashboard error:",
          error
        );


        renderStudentDashboardName();
      }
    );


  dashboardUnsubscribers.push(
    unsubscribe
  );
}


/* ------------------------------------------------------
   ENROLLMENTS
------------------------------------------------------ */

function connectStudentEnrollments(
  studentUid
) {
  const enrollmentQuery =
    query(
      collection(
        db,
        "enrollments"
      ),

      where(
        "studentUid",
        "==",
        studentUid
      )
    );


  const unsubscribe =
    onSnapshot(
      enrollmentQuery,

      function (snapshot) {
        const enrollments =
          [];


        snapshot.forEach(
          function (documentSnapshot) {
            enrollments.push({
              id:
                documentSnapshot.id,

              ...documentSnapshot.data()
            });
          }
        );


        studentDashboardState.enrollments =
          enrollments;


        renderStudentDashboard();
      },

      function (error) {
        console.error(
          "Student enrollment dashboard error:",
          error
        );
      }
    );


  dashboardUnsubscribers.push(
    unsubscribe
  );
}


/* ------------------------------------------------------
   VIDEO PROGRESS
------------------------------------------------------ */

function connectStudentProgress(
  studentUid
) {
  const progressQuery =
    query(
      collection(
        db,
        "studentProgress"
      ),

      where(
        "studentUid",
        "==",
        studentUid
      )
    );


  const unsubscribe =
    onSnapshot(
      progressQuery,

      function (snapshot) {
        const progress =
          [];


        snapshot.forEach(
          function (documentSnapshot) {
            progress.push({
              id:
                documentSnapshot.id,

              ...documentSnapshot.data()
            });
          }
        );


        studentDashboardState.progress =
          progress;


        renderStudentDashboard();
      },

      function (error) {
        console.error(
          "Student progress dashboard error:",
          error
        );
      }
    );


  dashboardUnsubscribers.push(
    unsubscribe
  );
}


/* ------------------------------------------------------
   VIDEOS
------------------------------------------------------ */

function connectPublishedVideos() {
  const unsubscribe =
    onSnapshot(
      collection(
        db,
        "videos"
      ),

      function (snapshot) {
        const videos =
          [];


        snapshot.forEach(
          function (documentSnapshot) {
            const video =
              documentSnapshot.data();


            if (
              video.status ===
              "published"
            ) {
              videos.push({
                id:
                  documentSnapshot.id,

                ...video
              });
            }
          }
        );


        studentDashboardState.videos =
          videos;


        renderStudentDashboard();
      },

      function (error) {
        console.error(
          "Student videos dashboard error:",
          error
        );
      }
    );


  dashboardUnsubscribers.push(
    unsubscribe
  );
}


/* ------------------------------------------------------
   PDF REQUESTS
------------------------------------------------------ */

function connectStudentPdfRequests(
  studentUid
) {
  const pdfQuery =
    query(
      collection(
        db,
        "pdfRequests"
      ),

      where(
        "studentUid",
        "==",
        studentUid
      )
    );


  const unsubscribe =
    onSnapshot(
      pdfQuery,

      function (snapshot) {
        const pdfRequests =
          [];


        snapshot.forEach(
          function (documentSnapshot) {
            pdfRequests.push({
              id:
                documentSnapshot.id,

              ...documentSnapshot.data()
            });
          }
        );


        studentDashboardState.pdfRequests =
          pdfRequests;


        renderStudentDashboard();
      },

      function (error) {
        console.error(
          "Student PDF request dashboard error:",
          error
        );
      }
    );


  dashboardUnsubscribers.push(
    unsubscribe
  );
}


/* ------------------------------------------------------
   CONSULTATIONS
------------------------------------------------------ */

function connectStudentConsultations(
  studentUid
) {
  const consultationQuery =
    query(
      collection(
        db,
        "consultationRequests"
      ),

      where(
        "studentUid",
        "==",
        studentUid
      )
    );


  const unsubscribe =
    onSnapshot(
      consultationQuery,

      function (snapshot) {
        const consultations =
          [];


        snapshot.forEach(
          function (documentSnapshot) {
            consultations.push({
              id:
                documentSnapshot.id,

              ...documentSnapshot.data()
            });
          }
        );


        studentDashboardState.consultations =
          consultations;


        renderStudentDashboard();
      },

      function (error) {
        console.error(
          "Student consultation dashboard error:",
          error
        );
      }
    );


  dashboardUnsubscribers.push(
    unsubscribe
  );
}


/* ------------------------------------------------------
   ANNOUNCEMENTS
------------------------------------------------------ */

function connectStudentAnnouncements() {
  const unsubscribe =
    onSnapshot(
      collection(
        db,
        "announcements"
      ),

      function (snapshot) {
        const announcements =
          [];


        snapshot.forEach(
          function (documentSnapshot) {
            const announcement =
              documentSnapshot.data();


            if (
              announcement.status ===
                "active" &&
              (
                announcement.audience ===
                  "students" ||
                announcement.audience ===
                  "all"
              )
            ) {
              announcements.push({
                id:
                  documentSnapshot.id,

                ...announcement
              });
            }
          }
        );


        studentDashboardState.announcements =
          announcements;


        renderStudentDashboard();
      },

      function (error) {
        console.error(
          "Student announcements dashboard error:",
          error
        );
      }
    );


  dashboardUnsubscribers.push(
    unsubscribe
  );
}


/* ======================================================
   MAIN RENDER FUNCTION
====================================================== */

function renderStudentDashboard() {
  renderStudentDashboardName();

  renderStudentDashboardCounts();

  renderStudentContinueWatching();

  renderStudentUpcomingSession();

  renderStudentDashboardNotifications();
}


/* ------------------------------------------------------
   WELCOME FIRST NAME
------------------------------------------------------ */

function renderStudentDashboardName() {
  const target =
    document.getElementById(
      "student-dashboard-first-name"
    );


  if (!target) {
    return;
  }


  const profileName =
    String(
      studentDashboardState
        .profile
        ?.name || ""
    )
      .trim();


  const email =
    studentDashboardState
      .user
      ?.email || "";


  target.textContent =
    extractStudentFirstName(
      profileName,
      email
    );
}


/* ------------------------------------------------------
   EXTRACT FIRST NAME FROM PROFILE OR EMAIL
------------------------------------------------------ */

function extractStudentFirstName(
  profileName,
  email
) {
  if (
    profileName
  ) {
    return capitalizeStudentName(
      profileName
        .split(/\s+/)[0]
    );
  }


  const emailPrefix =
    String(
      email || ""
    )
      .split("@")[0]
      .split(/[._+\-\d]+/)
      .filter(Boolean)[0] ||
    "Student";


  return capitalizeStudentName(
    emailPrefix
  );
}


function capitalizeStudentName(
  value
) {
  const name =
    String(value || "Student")
      .trim();


  if (!name) {
    return "Student";
  }


  return (
    name.charAt(0)
      .toUpperCase() +
    name.slice(1)
      .toLowerCase()
  );
}


/* ------------------------------------------------------
   DASHBOARD COUNTS
------------------------------------------------------ */

function renderStudentDashboardCounts() {
  const activeEnrollments =
    studentDashboardState
      .enrollments
      .filter(
        function (enrollment) {
          return (
            enrollment.status !==
            "cancelled"
          );
        }
      );


  const watchedVideoIds =
    new Set(
      studentDashboardState
        .progress
        .filter(
          function (progress) {
            return (
              Number(
                progress.progressPercent
              ) >
              0
            );
          }
        )
        .map(
          function (progress) {
            return progress.videoId;
          }
        )
    );


  const approvedPdfRequests =
    studentDashboardState
      .pdfRequests
      .filter(
        function (request) {
          return (
            request.status ===
            "approved"
          );
        }
      );


  const approvedSessions =
    studentDashboardState
      .consultations
      .filter(
        function (request) {
          return (
            request.status ===
            "approved"
          );
        }
      );


  setStudentDashboardText(
    "student-dashboard-enrolled-count",
    activeEnrollments.length
  );


  setStudentDashboardText(
    "student-dashboard-video-count",
    watchedVideoIds.size
  );


  setStudentDashboardText(
    "student-dashboard-pdf-count",
    approvedPdfRequests.length
  );


  setStudentDashboardText(
    "student-dashboard-session-count",
    approvedSessions.length
  );
}


/* ------------------------------------------------------
   CONTINUE WATCHING
------------------------------------------------------ */

function renderStudentContinueWatching() {
  const container =
    document.getElementById(
      "student-dashboard-continue-watching"
    );


  if (!container) {
    return;
  }


  const progressItems =
    studentDashboardState
      .progress
      .filter(
        function (progress) {
          const percentage =
            Number(
              progress.progressPercent
            );


          return (
            percentage >
              0 &&
            percentage <
              100
          );
        }
      )
      .sort(
        function (
          first,
          second
        ) {
          return (
            getStudentTimestampSeconds(
              second.updatedAt
            ) -
            getStudentTimestampSeconds(
              first.updatedAt
            )
          );
        }
      )
      .slice(
        0,
        4
      );


  if (
    progressItems.length ===
    0
  ) {
    container.innerHTML = `
      <div class="student-dashboard-empty">
        Your learning progress will appear here.
      </div>
    `;

    return;
  }


  container.innerHTML =
    progressItems
      .map(
        function (progress) {
          const video =
            studentDashboardState
              .videos
              .find(
                function (item) {
                  return (
                    item.id ===
                    progress.videoId
                  );
                }
              );


          const percentage =
            Math.min(
              Math.max(
                Number(
                  progress.progressPercent
                ) ||
                0,

                0
              ),

              100
            );


          return `
            <div class="student-dashboard-progress-row">

              <div>

                <div class="student-dashboard-progress-title">
                  ${escapeStudentDashboardText(
                    video?.title ||
                    progress.videoTitle ||
                    "Video Lesson"
                  )}
                </div>

                <div class="student-dashboard-progress-meta">
                  ${escapeStudentDashboardText(
                    video?.subject ||
                    progress.subject ||
                    "Learning Content"
                  )}
                </div>

              </div>


              <div class="student-dashboard-progress-right">

                <div class="student-dashboard-progress-track">

                  <div
                    class="student-dashboard-progress-fill"
                    style="
                      width:${percentage}%
                    ">
                  </div>

                </div>

                <div class="student-dashboard-progress-percent">
                  ${percentage}%
                </div>

              </div>

            </div>
          `;
        }
      )
      .join("");
}


/* ------------------------------------------------------
   UPCOMING CONSULTATION
------------------------------------------------------ */

function renderStudentUpcomingSession() {
  const container =
    document.getElementById(
      "student-dashboard-upcoming-session"
    );


  if (!container) {
    return;
  }


  const approvedSessions =
    studentDashboardState
      .consultations
      .filter(
        function (request) {
          return (
            request.status ===
              "approved" &&
            request.scheduledDate
          );
        }
      )
      .sort(
        function (
          first,
          second
        ) {
          return (
            createStudentSessionDate(
              first
            ) -
            createStudentSessionDate(
              second
            )
          );
        }
      );


  const upcomingSession =
    approvedSessions.find(
      function (request) {
        return (
          createStudentSessionDate(
            request
          ) >=
          Date.now() -
            86400000
        );
      }
    );


  if (!upcomingSession) {
    container.innerHTML = `
      <div class="student-dashboard-empty">
        Your next confirmed consultation will appear here.
      </div>
    `;

    return;
  }


  const meetingLink =
    String(
      upcomingSession.meetingLink ||
      ""
    );


  const hasMeetingLink =
    meetingLink.startsWith(
      "https://"
    );


  container.innerHTML = `
    <div class="student-dashboard-session-card">

      <div>

        <div class="student-dashboard-session-title">
          ${escapeStudentDashboardText(
            upcomingSession.sessionTitle ||
            upcomingSession.subject +
              " Consultation"
          )}
        </div>

        <div class="student-dashboard-session-meta">
          ${escapeStudentDashboardText(
            upcomingSession.scheduledDate
          )}
          ·
          ${escapeStudentDashboardText(
            upcomingSession.scheduledTime ||
            "Time to be confirmed"
          )}
          ·
          ${escapeStudentDashboardText(
            upcomingSession.teacherName ||
            "Teacher to be assigned"
          )}
        </div>

      </div>


      <div class="student-dashboard-session-actions">

        <span class="badge badge-green">
          Confirmed
        </span>

        ${
          hasMeetingLink
            ? `
              <a
                class="act-btn"
                href="${escapeStudentDashboardText(
                  meetingLink
                )}"
                target="_blank"
                rel="noopener noreferrer">
                Join Session
              </a>
            `
            : ""
        }

      </div>

    </div>
  `;
}


/* ------------------------------------------------------
   DASHBOARD NOTIFICATIONS
------------------------------------------------------ */

function renderStudentDashboardNotifications() {
  const container =
    document.getElementById(
      "student-dashboard-notifications"
    );


  if (!container) {
    return;
  }


  const notifications =
    [];


  studentDashboardState
    .announcements
    .forEach(
      function (announcement) {
        notifications.push({
          title:
            announcement.title ||
            "New announcement",

          message:
            announcement.message ||
            "",

          createdAt:
            announcement.createdAt
        });
      }
    );


  studentDashboardState
    .pdfRequests
    .filter(
      function (request) {
        return (
          request.status ===
          "approved"
        );
      }
    )
    .forEach(
      function (request) {
        notifications.push({
          title:
            "PDF access approved",

          message:
            request.pdfName ||
            "Your requested PDF is now available.",

          createdAt:
            request.reviewedAt ||
            request.createdAt
        });
      }
    );


  studentDashboardState
    .consultations
    .filter(
      function (request) {
        return (
          request.status ===
          "approved"
        );
      }
    )
    .forEach(
      function (request) {
        notifications.push({
          title:
            "Consultation confirmed",

          message:
            request.sessionTitle ||
            request.subject +
              " consultation",

          createdAt:
            request.reviewedAt ||
            request.createdAt
        });
      }
    );


  notifications.sort(
    function (
      first,
      second
    ) {
      return (
        getStudentTimestampSeconds(
          second.createdAt
        ) -
        getStudentTimestampSeconds(
          first.createdAt
        )
      );
    }
  );


  const latestNotifications =
    notifications.slice(
      0,
      5
    );


  if (
    latestNotifications.length ===
    0
  ) {
    container.innerHTML = `
      <div class="student-dashboard-empty">
        New notifications will appear here.
      </div>
    `;

    return;
  }


  container.innerHTML =
    latestNotifications
      .map(
        function (notification) {
          return `
            <div class="student-dashboard-notification-row">

              <div class="student-dashboard-notification-dot">
              </div>

              <div>

                <div class="student-dashboard-notification-title">
                  ${escapeStudentDashboardText(
                    notification.title
                  )}
                </div>

                <div class="student-dashboard-notification-message">
                  ${escapeStudentDashboardText(
                    notification.message
                  )}
                </div>

              </div>

            </div>
          `;
        }
      )
      .join("");
}


/* ======================================================
   SAVE VIDEO PROGRESS
   Call this whenever the video player progress changes.
====================================================== */

window.saveStudentVideoProgress =
  async function (
    videoId,
    progressPercent
  ) {
    const user =
      auth.currentUser;


    if (
      !user ||
      !videoId
    ) {
      return;
    }


    const safeProgress =
      Math.min(
        Math.max(
          Math.round(
            Number(
              progressPercent
            ) ||
            0
          ),

          0
        ),

        100
      );


    try {
      await setDoc(
        doc(
          db,
          "studentProgress",
          user.uid +
            "_" +
            videoId
        ),

        {
          studentUid:
            user.uid,

          videoId:
            videoId,

          progressPercent:
            safeProgress,

          updatedAt:
            serverTimestamp()
        },

        {
          merge:
            true
        }
      );


    } catch (error) {
      console.error(
        "Video progress update failed:",
        error
      );
    }
  };


/* ======================================================
   HELPERS
====================================================== */

function setStudentDashboardText(
  elementId,
  value
) {
  const element =
    document.getElementById(
      elementId
    );


  if (element) {
    element.textContent =
      String(value);
  }
}


function createStudentSessionDate(
  session
) {
  const dateText =
    session.scheduledDate ||
    "";


  const timeText =
    session.scheduledTime ||
    "00:00";


  const normalizedTime =
    normalizeStudentSessionTime(
      timeText
    );


  const date =
    new Date(
      dateText +
      "T" +
      normalizedTime
    );


  return Number.isNaN(
    date.getTime()
  )
    ? 0
    : date.getTime();
}


function normalizeStudentSessionTime(
  value
) {
  const text =
    String(value || "")
      .trim();


  const twelveHourMatch =
    text.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
    );


  if (
    twelveHourMatch
  ) {
    let hours =
      Number(
        twelveHourMatch[1]
      );


    const minutes =
      twelveHourMatch[2];


    const period =
      twelveHourMatch[3]
        .toUpperCase();


    if (
      period ===
        "PM" &&
      hours !==
        12
    ) {
      hours +=
        12;
    }


    if (
      period ===
        "AM" &&
      hours ===
        12
    ) {
      hours =
        0;
    }


    return (
      String(hours)
        .padStart(
          2,
          "0"
        ) +
      ":" +
      minutes
    );
  }


  if (
    /^\d{2}:\d{2}$/.test(
      text
    )
  ) {
    return text;
  }


  return "00:00";
}


function getStudentTimestampSeconds(
  timestamp
) {
  if (
    timestamp?.seconds
  ) {
    return timestamp.seconds;
  }


  if (
    typeof timestamp?.toDate ===
    "function"
  ) {
    return Math.floor(
      timestamp
        .toDate()
        .getTime() /
      1000
    );
  }


  const date =
    new Date(
      timestamp ||
      0
    );


  return Number.isNaN(
    date.getTime()
  )
    ? 0
    : Math.floor(
      date.getTime() /
      1000
    );
}


function escapeStudentDashboardText(
  value
) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

