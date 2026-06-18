/* ======================================================
   ADMIN FIREBASE TESTIMONIALS MANAGER
====================================================== */

import {
  db,
  auth
} from "./firebase-config.js";


import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";


/* ======================================================
   ADMIN TESTIMONIAL MANAGER STARTUP STATE
====================================================== */

let adminTestimonialsStarted =
  false;

let adminTestimonialsListenerConnected =
  false;

/* ------------------------------------------------------
   SAFE TEXT OUTPUT
------------------------------------------------------ */

function escapeAdminTestimonialText(
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
   CREATE SIDEBAR MENU ITEM
------------------------------------------------------ */

function createTestimonialsSidebarItem() {
  const sidebar =
    document.querySelector(
      ".admin-side"
    );


  if (
    !sidebar ||
    document.getElementById(
      "admin-testimonials-nav-item"
    )
  ) {
    return;
  }


  const group =
    document.createElement(
      "div"
    );


  group.className =
    "admin-nav-group";


  group.innerHTML = `
    <div class="admin-nav-label">
      Community
    </div>

    <div
      id="admin-testimonials-nav-item"
      class="admin-nav-item">

      <span class="admin-nav-dot">
      </span>

      ðŸ’› Testimonials

    </div>
  `;


  sidebar.appendChild(
    group
  );


  document
    .getElementById(
      "admin-testimonials-nav-item"
    )
    .addEventListener(
      "click",
      function () {
        openTestimonialsPanel();
      }
    );
}


/* ------------------------------------------------------
   CREATE ADMIN PANEL
------------------------------------------------------ */

function createTestimonialsAdminPanel() {
  const adminMain =
    document.querySelector(
      ".admin-main"
    );


  if (
    !adminMain ||
    document.getElementById(
      "admin-panel-testimonials"
    )
  ) {
    return;
  }


  const panel =
    document.createElement(
      "section"
    );


  panel.id =
    "admin-panel-testimonials";

  panel.className =
    "admin-panel";


  panel.innerHTML = `
    <div class="section-head">

      <div class="page-title">
        Testimonials
      </div>

      <div class="page-subtitle">
        Add, publish, hide, and remove student testimonials.
      </div>

    </div>


    <div class="two-col">

      <div class="admin-page-card">

        <div class="db-recent">
          Add Testimonial
        </div>


        <form id="testimonial-create-form">

          <div class="form-group">

            <label class="form-label">
              Student or Parent Name
            </label>

            <input
              id="testimonial-student-name"
              class="form-input"
              type="text"
              placeholder="Example: 2023 GCE A/L Student"
              required>

          </div>


          <div
            class="form-group"
            style="margin-top:16px">

            <label class="form-label">
              Grade or Description
            </label>

            <input
              id="testimonial-grade"
              class="form-input"
              type="text"
              placeholder="Example: A Grade">

          </div>


          <div
            class="form-group"
            style="margin-top:16px">

            <label class="form-label">
              Rating
            </label>

            <select
              id="testimonial-rating"
              class="form-select"
              required>

              <option value="5">
                5 Stars
              </option>

              <option value="4">
                4 Stars
              </option>

              <option value="3">
                3 Stars
              </option>

              <option value="2">
                2 Stars
              </option>

              <option value="1">
                1 Star
              </option>

            </select>

          </div>


          <div
            class="form-group"
            style="margin-top:16px">

            <label class="form-label">
              Accent Colour
            </label>

            <select
              id="testimonial-accent"
              class="form-select">

              <option value="pink">
                Pink
              </option>

              <option value="mint">
                Mint
              </option>

              <option value="lilac">
                Lilac
              </option>

            </select>

          </div>


          <div
            class="form-group"
            style="margin-top:16px">

            <label class="form-label">
              Icon
            </label>

            <input
              id="testimonial-icon"
              class="form-input"
              type="text"
              value="ðŸŽ€"
              maxlength="8">

          </div>


          <div
            class="form-group"
            style="margin-top:16px">

            <label class="form-label">
              Testimonial Message
            </label>

            <textarea
              id="testimonial-message"
              class="form-input"
              rows="8"
              required>
            </textarea>

          </div>


          <button
            class="btn-primary"
            type="submit"
            style="margin-top:18px">
            Publish Testimonial
          </button>

        </form>

      </div>


      <div>

        <div class="analytics-grid">

          <div class="ana-card">

            <div class="ana-label">
              Total Testimonials
            </div>

            <div
              id="testimonial-total-count"
              class="ana-val">
              0
            </div>

          </div>


          <div class="ana-card">

            <div class="ana-label">
              Published
            </div>

            <div
              id="testimonial-active-count"
              class="ana-val">
              0
            </div>

          </div>

        </div>

      </div>

    </div>


    <div
      class="table-wrap"
      style="margin-top:28px">

      <div class="table-head-row">

        <div class="table-title">
          Testimonial Library
        </div>

      </div>


      <table>

        <thead>
          <tr>
            <th>Name</th>
            <th>Grade</th>
            <th>Rating</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody
          id="firebase-testimonials-body">
        </tbody>

      </table>

    </div>
  `;


  adminMain.appendChild(
    panel
  );


  document
    .getElementById(
      "testimonial-create-form"
    )
    .addEventListener(
      "submit",
      createFirebaseTestimonial
    );
}

/* ------------------------------------------------------
   KEEP TESTIMONIAL PANEL AS A TOP-LEVEL ADMIN PAGE
------------------------------------------------------ */

function ensureTestimonialsPanelPlacement() {
  const adminMain =
    document.querySelector(
      ".admin-main"
    );


  const testimonialPanel =
    document.getElementById(
      "admin-panel-testimonials"
    );


  if (
    !adminMain ||
    !testimonialPanel
  ) {
    return;
  }


  /*
    Keep the Testimonials page beside the other
    admin panels instead of nesting it inside one.
  */
  if (
    testimonialPanel.parentElement !==
    adminMain
  ) {
    adminMain.appendChild(
      testimonialPanel
    );
  }
}

/* ------------------------------------------------------
   OPEN TESTIMONIAL PANEL
------------------------------------------------------ */

function openTestimonialsPanel() {
  createTestimonialsAdminPanel();

  ensureTestimonialsPanelPlacement();


  const testimonialPanel =
    document.getElementById(
      "admin-panel-testimonials"
    );


  if (!testimonialPanel) {
    console.error(
      "Testimonials admin panel was not created."
    );

    return;
  }


  document
    .querySelectorAll(
      ".admin-panel"
    )
    .forEach(
      function (panel) {
        panel.classList.remove(
          "active"
        );
      }
    );


  document
    .querySelectorAll(
      ".admin-nav-item"
    )
    .forEach(
      function (item) {
        item.classList.remove(
          "active"
        );
      }
    );


  testimonialPanel.classList.add(
    "active"
  );


  document
    .getElementById(
      "admin-testimonials-nav-item"
    )
    ?.classList
    .add(
      "active"
    );


  window.scrollTo({
    top:
      0,

    behavior:
      "smooth"
  });
}

/* ------------------------------------------------------
   CREATE TESTIMONIAL
------------------------------------------------------ */

async function createFirebaseTestimonial(
  event
) {
  event.preventDefault();


  const user =
    auth.currentUser;


  if (!user) {
    alert(
      "Please sign in again."
    );

    return;
  }


  const studentName =
    document
      .getElementById(
        "testimonial-student-name"
      )
      .value
      .trim();


  const grade =
    document
      .getElementById(
        "testimonial-grade"
      )
      .value
      .trim();


  const rating =
    Number(
      document
        .getElementById(
          "testimonial-rating"
        )
        .value
    );


  const accent =
    document
      .getElementById(
        "testimonial-accent"
      )
      .value;


  const icon =
    document
      .getElementById(
        "testimonial-icon"
      )
      .value
      .trim() ||
    "ðŸŽ€";


  const message =
    document
      .getElementById(
        "testimonial-message"
      )
      .value
      .trim();


  if (
    !studentName ||
    !message
  ) {
    alert(
      "Please complete the testimonial details."
    );

    return;
  }


  try {
    await addDoc(
      collection(
        db,
        "testimonials"
      ),

      {
        studentName:
          studentName,

        grade:
          grade,

        rating:
          rating,

        accent:
          accent,

        icon:
          icon,

        message:
          message,

        status:
          "active",

        createdBy:
          user.uid,

        createdAt:
          serverTimestamp()
      }
    );


    document
      .getElementById(
        "testimonial-create-form"
      )
      .reset();


    document
      .getElementById(
        "testimonial-icon"
      )
      .value =
        "ðŸŽ€";


    alert(
      "Testimonial published successfully."
    );


  } catch (error) {
    console.error(
      "Testimonial creation failed:",
      error
    );


    alert(
      "The testimonial could not be published."
    );
  }
}


/* ------------------------------------------------------
   RENDER ADMIN TESTIMONIAL TABLE
------------------------------------------------------ */

function connectAdminTestimonials() {

   if (
  adminTestimonialsListenerConnected
) {
  return;
}


adminTestimonialsListenerConnected =
  true; 

  onSnapshot(
    collection(
      db,
      "testimonials"
    ),

    function (snapshot) {
      const testimonials = [];


      snapshot.forEach(
        function (
          testimonialDocument
        ) {
          testimonials.push({
            id:
              testimonialDocument.id,

            ...testimonialDocument.data()
          });
        }
      );


      testimonials.sort(
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


      renderAdminTestimonials(
        testimonials
      );
    },

    function (error) {
      console.error(
        "Admin testimonials could not be loaded:",
        error
      );
    }
  );
}


/* ------------------------------------------------------
   DRAW ADMIN TABLE
------------------------------------------------------ */

function renderAdminTestimonials(
  testimonials
) {
  const tableBody =
    document.getElementById(
      "firebase-testimonials-body"
    );


  if (!tableBody) {
    return;
  }


  const totalCount =
    document.getElementById(
      "testimonial-total-count"
    );


  const activeCount =
    document.getElementById(
      "testimonial-active-count"
    );


  if (totalCount) {
    totalCount.textContent =
      testimonials.length;
  }


  if (activeCount) {
    activeCount.textContent =
      testimonials.filter(
        function (testimonial) {
          return (
            testimonial.status ===
            "active"
          );
        }
      ).length;
  }


  if (
    testimonials.length ===
    0
  ) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5">
          No testimonials have been added yet.
        </td>
      </tr>
    `;

    return;
  }


  tableBody.innerHTML =
    testimonials
      .map(
        function (testimonial) {
          const isActive =
            testimonial.status ===
            "active";


          return `
            <tr>

              <td>
                ${escapeAdminTestimonialText(
                  testimonial.studentName
                )}
              </td>

              <td>
                ${escapeAdminTestimonialText(
                  testimonial.grade ||
                  "â€”"
                )}
              </td>

              <td>
                ${escapeAdminTestimonialText(
                  testimonial.rating ||
                  5
                )}
                â­
              </td>

              <td>
                ${
                  isActive
                    ? `
                      <span class="badge badge-green">
                        Published
                      </span>
                    `
                    : `
                      <span class="badge badge-gray">
                        Hidden
                      </span>
                    `
                }
              </td>

              <td>

                <div class="action-row">

                  <button
                    class="act-btn"
                    type="button"
                    data-toggle-testimonial="${escapeAdminTestimonialText(
                      testimonial.id
                    )}"
                    data-testimonial-status="${escapeAdminTestimonialText(
                      testimonial.status
                    )}">
                    ${
                      isActive
                        ? "Hide"
                        : "Publish"
                    }
                  </button>


                  <button
                    class="act-btn danger"
                    type="button"
                    data-remove-testimonial="${escapeAdminTestimonialText(
                      testimonial.id
                    )}">
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


/* ------------------------------------------------------
   TESTIMONIAL ACTION BUTTONS
------------------------------------------------------ */

document.addEventListener(
  "click",

  async function (event) {
    const toggleButton =
      event.target.closest(
        "[data-toggle-testimonial]"
      );


    if (toggleButton) {
      const testimonialId =
        toggleButton.dataset
          .toggleTestimonial;


      const currentStatus =
        toggleButton.dataset
          .testimonialStatus;


      try {
        await updateDoc(
          doc(
            db,
            "testimonials",
            testimonialId
          ),

          {
            status:
              currentStatus ===
                "active"
                ? "hidden"
                : "active"
          }
        );


      } catch (error) {
        console.error(
          "Testimonial update failed:",
          error
        );


        alert(
          "The testimonial status could not be updated."
        );
      }


      return;
    }


    const removeButton =
      event.target.closest(
        "[data-remove-testimonial]"
      );


    if (!removeButton) {
      return;
    }


    const confirmed =
      confirm(
        "Remove this testimonial permanently?"
      );


    if (!confirmed) {
      return;
    }


    try {
      await deleteDoc(
        doc(
          db,
          "testimonials",
          removeButton.dataset
            .removeTestimonial
        )
      );


    } catch (error) {
      console.error(
        "Testimonial removal failed:",
        error
      );


      alert(
        "The testimonial could not be removed."
      );
    }
  }
);

/* ------------------------------------------------------
   START ADMIN TESTIMONIAL MANAGER
------------------------------------------------------ */

function startAdminTestimonials() {
  if (
    adminTestimonialsStarted
  ) {
    return;
  }


  const adminMain =
    document.querySelector(
      ".admin-main"
    );


  /*
    Wait until the primary admin script has created
    the standard admin layout.
  */
  if (!adminMain) {
    setTimeout(
      startAdminTestimonials,
      120
    );

    return;
  }


  adminTestimonialsStarted =
    true;


  createTestimonialsSidebarItem();

  createTestimonialsAdminPanel();

  ensureTestimonialsPanelPlacement();

  connectAdminTestimonials();


  console.log(
    "Admin testimonials manager connected."
  );
}


if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    startAdminTestimonials
  );

} else {
  startAdminTestimonials();
}
