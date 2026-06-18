/* ======================================================
   LIVE FIREBASE STUDY NOTES FOR STUDENT PANEL
====================================================== */

import {
  db
} from "./firebase-config.js";


import {
  collection,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

/* ======================================================
   STATE
====================================================== */

let liveStudentNotes =
  [];


let selectedNoteSubject =
  "all";


let notesListenerConnected =
  false;


/* ------------------------------------------------------
   SAFE TEXT OUTPUT
------------------------------------------------------ */

function escapeStudentNoteText(
  value
) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* ------------------------------------------------------
   NORMALIZE SUBJECT
------------------------------------------------------ */

function normalizeStudentNoteSubject(
  value
) {
  return String(value || "")
    .trim()
    .toLowerCase();
}


/* ======================================================
   CREATE NOTES PANEL CONTENT
====================================================== */

function ensureStudentNotesPanel() {
  const panel =
    document.getElementById(
      "student-panel-study-notes"
    );


  if (!panel) {
    return false;
  }


  if (
    document.getElementById(
      "student-live-notes-grid"
    )
  ) {
    return true;
  }


  panel.innerHTML = `
    <div class="section-head">

      <div class="page-title">
        Study Notes
      </div>

      <div class="page-subtitle">
        Browse Business Studies and Chemistry study notes
        uploaded by your teachers.
      </div>

    </div>


    <div class="student-notes-filter-row">

      <button
        class="student-note-filter active"
        type="button"
        data-student-note-filter="all">
        âœ¦ All Notes
      </button>


      <button
        class="student-note-filter"
        type="button"
        data-student-note-filter="business studies">
        ðŸ“Š Business Studies
      </button>


      <button
        class="student-note-filter"
        type="button"
        data-student-note-filter="chemistry">
        âš— Chemistry
      </button>

    </div>


    <div
      id="student-live-notes-grid"
      class="student-notes-grid">

      <div class="student-dashboard-empty">
        Study notes uploaded by your teachers
        will appear here.
      </div>

    </div>
  `;


  return true;
}


/* ======================================================
   CREATE ONE NOTE CARD
====================================================== */

function createStudentNoteCard(
  note
) {
  const title =
    escapeStudentNoteText(
      note.title ||
      "Study Note"
    );


  const subject =
    escapeStudentNoteText(
      note.subject ||
      "Learning Content"
    );


  const description =
    escapeStudentNoteText(
      note.description ||
      ""
    );


  const teacher =
    escapeStudentNoteText(
      note.teacher ||
      note.teacherName ||
      "Teacher"
    );


  const imageUrl =
    escapeStudentNoteText(
      note.imageUrl ||
      note.fileUrl ||
      note.downloadUrl ||
      note.url ||
      ""
    );


  const hasImage =
    imageUrl.startsWith(
      "https://"
    );


  return `
    <article class="student-note-card">

      <div class="student-note-image-wrap">

        ${
          hasImage
            ? `
              <img
                class="student-note-image"
                src="${imageUrl}"
                alt="${title}"
                loading="lazy">
            `
            : `
              <div class="student-note-placeholder">
                ðŸ“
              </div>
            `
        }

      </div>


      <div class="student-note-body">

        <div class="student-note-subject">
          ${subject}
        </div>


        <div class="student-note-title">
          ${title}
        </div>


        ${
          description
            ? `
              <div class="student-note-description">
                ${description}
              </div>
            `
            : ""
        }


        <div class="student-note-teacher">
          ${teacher}
        </div>

      </div>

    </article>
  `;
}


/* ======================================================
   RENDER NOTES
====================================================== */

function renderStudentNotes(
  subject
) {
  if (
    !ensureStudentNotesPanel()
  ) {
    return;
  }


  selectedNoteSubject =
    normalizeStudentNoteSubject(
      subject ||
      "all"
    );


  const grid =
    document.getElementById(
      "student-live-notes-grid"
    );


  if (!grid) {
    return;
  }


  const filteredNotes =
    liveStudentNotes
      .filter(
        function (note) {
          const noteSubject =
            normalizeStudentNoteSubject(
              note.subject
            );


          return (
            selectedNoteSubject ===
              "all" ||
            noteSubject ===
              selectedNoteSubject
          );
        }
      );


  if (
    filteredNotes.length ===
    0
  ) {
    grid.innerHTML = `
      <div class="student-dashboard-empty">
        No study notes are available for this subject yet.
      </div>
    `;

    return;
  }


  grid.innerHTML =
    filteredNotes
      .map(
        createStudentNoteCard
      )
      .join("");
}


/*
  Keeps compatibility with student.js.
*/
window.renderStudentNotes =
  renderStudentNotes;


/* ======================================================
   FIRESTORE LISTENER
====================================================== */

function connectStudentNotesFirebase() {
  if (
    notesListenerConnected
  ) {
    return;
  }


  notesListenerConnected =
    true;


 const activeStudyNotesQuery =
  query(
    collection(
      db,
      "studyNotes"
    ),

    where(
      "status",
      "==",
      "active"
    )
  );


onSnapshot(
  activeStudyNotesQuery,

    function (snapshot) {
      const notes =
        [];


      snapshot.forEach(
        function (noteDocument) {
          const note =
            noteDocument.data();


          const visible =
            !note.status ||
            note.status ===
              "active" ||
            note.status ===
              "published";


          if (!visible) {
            return;
          }


          notes.push({
            id:
              noteDocument.id,

            ...note
          });
        }
      );


      notes.sort(
        function (
          first,
          second
        ) {
          return (
            (
              second.createdAt
                ?.seconds ||
              0
            ) -
            (
              first.createdAt
                ?.seconds ||
              0
            )
          );
        }
      );


      liveStudentNotes =
        notes;


      renderStudentNotes(
        selectedNoteSubject
      );
    },

    function (error) {
      console.error(
        "Student study notes loading failed:",
        error
      );


      const grid =
        document.getElementById(
          "student-live-notes-grid"
        );


      if (grid) {
        grid.innerHTML = `
          <div class="student-dashboard-empty">
            Study notes could not be loaded.
          </div>
        `;
      }
    }
  );
}


/* ======================================================
   FILTER BUTTONS
====================================================== */

document.addEventListener(
  "click",

  function (event) {
    const filterButton =
      event.target.closest(
        "[data-student-note-filter]"
      );


    if (!filterButton) {
      return;
    }


    document
      .querySelectorAll(
        "[data-student-note-filter]"
      )
      .forEach(
        function (button) {
          button.classList.remove(
            "active"
          );
        }
      );


    filterButton.classList.add(
      "active"
    );


    renderStudentNotes(
      filterButton.dataset
        .studentNoteFilter
    );
  }
);


/* ======================================================
   START SAFELY
====================================================== */

function startStudentNotes() {
  /*
    Wait until student.js creates the Study Notes panel.
    No MutationObserver is used.
  */
  if (
    !ensureStudentNotesPanel()
  ) {
    setTimeout(
      startStudentNotes,
      150
    );

    return;
  }


  connectStudentNotesFirebase();


  console.log(
    "Student live study notes connected."
  );
}


if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    startStudentNotes
  );

} else {
  startStudentNotes();
}
