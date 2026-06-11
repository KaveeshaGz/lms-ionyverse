/* ======================================================
   PUBLIC FIREBASE STUDY NOTES
====================================================== */

import {
  db
} from "./firebase-config.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";


let publicStudyNotes = [];

let selectedPublicSubject =
  "all";


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
   LOAD PUBLISHED NOTES FROM FIRESTORE
------------------------------------------------------ */

async function loadPublicStudyNotes() {
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
    <div style="
      grid-column:1/-1;
      padding:34px 18px;
      color:var(--ivory-dim);
      text-align:center;
    ">
      Loading Study Notes...
    </div>
  `;


  try {
    /*
      Public visitors receive published notes only.
    */
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


    const snapshot =
      await getDocs(
        notesQuery
      );


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
      function (firstNote, secondNote) {
        const firstTime =
          firstNote.createdAt?.seconds || 0;

        const secondTime =
          secondNote.createdAt?.seconds || 0;

        return secondTime - firstTime;
      }
    );


    renderPublicStudyNotes();


  } catch (error) {
    console.error(
      "Could not load public Study Notes:",
      error
    );


    grid.innerHTML = `
      <div style="
        grid-column:1/-1;
        padding:34px 18px;
        color:var(--ivory-dim);
        text-align:center;
      ">
        Study Notes could not be loaded.
        Check the browser Console.
      </div>
    `;
  }
}


/* ------------------------------------------------------
   DISPLAY PUBLISHED NOTES
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
      <div style="
        grid-column:1/-1;
        padding:34px 18px;
        color:var(--ivory-dim);
        text-align:center;
      ">
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
              class="note-card"
              data-subject="${escapePublicNoteText(
                normalizePublicSubject(
                  note.subject
                )
              )}">

              <img
                class="note-image"
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
   SUBJECT FILTERS
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
   NOTE PREVIEW POPUP
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


/* ------------------------------------------------------
   START PUBLIC NOTES PAGE
------------------------------------------------------ */

document.addEventListener(
  "DOMContentLoaded",
  function () {
    connectPublicStudyNoteFilters();

    loadPublicStudyNotes();
  }
);