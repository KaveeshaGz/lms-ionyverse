/* ======================================================
   LIVE FIREBASE STUDY NOTES FOR STUDENT PANEL
====================================================== */

import {
  db
} from "./firebase-config.js";


import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";


/* ======================================================
   STATE
====================================================== */

let studentLiveNotes =
  [];


let selectedStudentNoteSubject =
  "all";


let studentNotesListenerConnected =
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


/* ------------------------------------------------------
   CONNECT LIVE FIRESTORE NOTES
------------------------------------------------------ */

function connectLiveStudentNotes() {
  if (
    studentNotesListenerConnected
  ) {
    return;
  }


  studentNotesListenerConnected =
    true;


  onSnapshot(
    collection(
      db,
      "studyNotes"
    ),

    function (snapshot) {
      const notes =
        [];


      snapshot.forEach(
        function (noteDocument) {
          const note =
            noteDocument.data();


          /*
            Support both "active" and "published"
            status values.
          */
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
          const firstTime =
            first.createdAt?.seconds ||
            0;


          const secondTime =
            second.createdAt?.seconds ||
            0;


          return (
            secondTime -
            firstTime
          );
        }
      );


      studentLiveNotes =
        notes;


      renderStudentNotes(
        selectedStudentNoteSubject
      );
    },

    function (error) {
      console.error(
        "Student study notes could not be loaded:",
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


/* ------------------------------------------------------
   CREATE ONE NOTE CARD
------------------------------------------------------ */

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
                📝
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


/* ------------------------------------------------------
   RENDER NOTES
------------------------------------------------------ */

function renderStudentNotes(
  subject
) {
  selectedStudentNoteSubject =
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
    studentLiveNotes
      .filter(
        function (note) {
          const noteSubject =
            normalizeStudentNoteSubject(
              note.subject
            );


          return (
            selectedStudentNoteSubject ===
              "all" ||
            noteSubject ===
              selectedStudentNoteSubject
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
  Preserve compatibility with your existing
  student.js openStudentPanel function.
*/
window.renderStudentNotes =
  renderStudentNotes;


/* ------------------------------------------------------
   FILTER BUTTONS
------------------------------------------------------ */

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


/* ------------------------------------------------------
   START
------------------------------------------------------ */

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    connectLiveStudentNotes
  );

} else {
  connectLiveStudentNotes();
}