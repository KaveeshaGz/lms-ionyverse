/* ======================================================
   PUBLIC FIREBASE STUDY NOTES
   Live Firestore version
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


let publicStudyNotes = [];

let selectedPublicSubject =
  "all";

let stopPublicNotesListener =
  null;


/* ------------------------------------------------------
   SAFE TEXT OUTPUT
------------------------------------------------------ */

function escapePublicNoteText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function normalizePublicSubject(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}


/* ------------------------------------------------------
   START LIVE FIRESTORE NOTES LISTENER
------------------------------------------------------ */

function loadPublicStudyNotes() {
  const grid =
    document.getElementById(
      "public-notes-grid"
    );


  if (!grid) {
    console.error(
      "Public Study Notes grid was not found."
    );

    return;
  }


  grid.innerHTML = `
    <div class="public-notes-message">
      Loading Study Notes...
    </div>
  `;


  /*
    Prevent duplicate Firestore listeners.
  */
  if (stopPublicNotesListener) {
    stopPublicNotesListener();
  }


  const notesQuery =
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


  stopPublicNotesListener =
    onSnapshot(
      notesQuery,

      function (snapshot) {
        publicStudyNotes = [];


        snapshot.forEach(
          function (noteDocument) {
            publicStudyNotes.push({
              id:
                noteDocument.id,

              ...noteDocument.data()
            });
          }
        );


        publicStudyNotes.sort(
          function (
            firstNote,
            secondNote
          ) {
            const firstTime =
              firstNote
                .createdAt
                ?.seconds || 0;

            const secondTime =
              secondNote
                .createdAt
                ?.seconds || 0;

            return (
              secondTime -
              firstTime
            );
          }
        );


        renderPublicStudyNotes();
      },

      function (error) {
        console.error(
          "Could not load public Study Notes:",
          error
        );


        grid.innerHTML = `
          <div class="public-notes-message">
            Study Notes could not be loaded.
            Check the browser Console.
          </div>
        `;
      }
    );
}


/* ------------------------------------------------------
   DISPLAY ACTIVE NOTES
------------------------------------------------------ */

function renderPublicStudyNotes() {
  const grid =
    document.getElementById(
      "public-notes-grid"
    );


  if (!grid) {
    return;
  }


  let visibleNotes =
    [...publicStudyNotes];


  if (
    selectedPublicSubject !==
    "all"
  ) {
    visibleNotes =
      visibleNotes.filter(
        function (note) {
          return (
            normalizePublicSubject(
              note.subject
            ) ===
            selectedPublicSubject
          );
        }
      );
  }


  if (
    visibleNotes.length === 0
  ) {
    grid.innerHTML = `
      <div class="public-notes-message">
        No study notes are available yet.
      </div>
    `;

    return;
  }


  grid.innerHTML =
    visibleNotes
      .map(
        function (note) {
          return `
            <article
              class="note-card public-note-card">

              <img
                class="note-image public-note-image"
                src="${escapePublicNoteText(
                  note.imageUrl
                )}"
                alt="${escapePublicNoteText(
                  note.title
                )}">


              <div class="note-card-body">

                <div class="course-subject">
                  ${escapePublicNoteText(
                    note.subject
                  )}
                </div>


                <div class="note-title">
                  ${escapePublicNoteText(
                    note.title
                  )}
                </div>


                <p class="note-description">
                  ${escapePublicNoteText(
                    note.description
                  )}
                </p>


                <button
                  type="button"
                  class="note-view-btn"
                  data-open-public-note="${escapePublicNoteText(
                    note.id
                  )}">

                  View Note

                </button>

              </div>

            </article>
          `;
        }
      )
      .join("");


  grid
    .querySelectorAll(
      "[data-open-public-note]"
    )
    .forEach(
      function (button) {
        button.addEventListener(
          "click",
          function () {
            const noteId =
              button.dataset
                .openPublicNote;


            const note =
              publicStudyNotes
                .find(
                  function (item) {
                    return (
                      item.id ===
                      noteId
                    );
                  }
                );


            if (!note) {
              alert(
                "The Study Note could not be found."
              );

              return;
            }


            openPublicNoteModal(
              note
            );
          }
        );
      }
    );
}


/* ------------------------------------------------------
   SUBJECT FILTER BUTTONS
------------------------------------------------------ */

function connectPublicStudyNoteFilters() {
  document
    .querySelectorAll(
      "[data-public-note-filter]"
    )
    .forEach(
      function (button) {
        button.addEventListener(
          "click",
          function () {
            selectedPublicSubject =
              normalizePublicSubject(
                button.dataset
                  .publicNoteFilter
              );


            document
              .querySelectorAll(
                "[data-public-note-filter]"
              )
              .forEach(
                function (filterButton) {
                  filterButton
                    .classList
                    .remove(
                      "active"
                    );
                }
              );


            button
              .classList
              .add(
                "active"
              );


            renderPublicStudyNotes();
          }
        );
      }
    );
}


/* ------------------------------------------------------
   NOTE IMAGE POPUP
------------------------------------------------------ */

function openPublicNoteModal(note) {
  const modal =
    document.getElementById(
      "note-modal"
    );

  const image =
    document.getElementById(
      "note-modal-image"
    );

  const title =
    document.getElementById(
      "note-modal-title"
    );


  if (
    !modal ||
    !image ||
    !title
  ) {
    console.error(
      "Public Study Note popup was not found."
    );

    return;
  }


  image.src =
    note.imageUrl || "";

  image.alt =
    note.title || "Study Note";

  title.textContent =
    note.title || "Study Note";


  modal.style.display =
    "flex";

  document.body.style.overflow =
    "hidden";
}


window.closeNoteImage =
  function () {
    const modal =
      document.getElementById(
        "note-modal"
      );


    if (modal) {
      modal.style.display =
        "none";
    }


    document.body.style.overflow =
      "";
  };


/*
  Useful while testing from the browser Console.
*/
window.loadPublicStudyNotes =
  loadPublicStudyNotes;


/* ------------------------------------------------------
   START PUBLIC NOTES
------------------------------------------------------ */

function startPublicNotes() {
  connectPublicStudyNoteFilters();

  loadPublicStudyNotes();
}


if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    startPublicNotes
  );

} else {
  startPublicNotes();
}
