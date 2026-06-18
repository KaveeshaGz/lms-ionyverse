/* ======================================================
   PUBLIC FIREBASE TESTIMONIALS
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


/* ------------------------------------------------------
   SAFE TEXT OUTPUT
------------------------------------------------------ */

function escapePublicTestimonialText(
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
   CREATE RATING STARS
------------------------------------------------------ */

function createPublicTestimonialStars(
  rating
) {
  const safeRating =
    Math.min(
      Math.max(
        Number(rating) || 5,
        1
      ),
      5
    );


  return new Array(
    safeRating
  )
    .fill(
      "<span>★</span>"
    )
    .join("");
}


/* ------------------------------------------------------
   CREATE ONE TESTIMONIAL CARD
------------------------------------------------------ */

function createPublicTestimonialCard(
  testimonial
) {
  const name =
    escapePublicTestimonialText(
      testimonial.studentName ||
      "Student"
    );


  const grade =
    escapePublicTestimonialText(
      testimonial.grade ||
      ""
    );


  const message =
    escapePublicTestimonialText(
      testimonial.message ||
      ""
    )
      .replace(
        /\n/g,
        "<br>"
      );


  const icon =
    escapePublicTestimonialText(
      testimonial.icon ||
      "🎀"
    );


  const accentClass =
    testimonial.accent ===
      "mint"
      ? "av-mint"
      : testimonial.accent ===
        "lilac"
        ? "av-lilac"
        : "av-pink";


  return `
    <article class="testimonial-card">

      <div
        class="star-row"
        aria-label="${
          Number(
            testimonial.rating
          ) || 5
        } star testimonial">

        ${createPublicTestimonialStars(
          testimonial.rating
        )}

      </div>


      <div
        class="quote-mark"
        aria-hidden="true">
        ”
      </div>


      <div class="testimonial-text">
        ${message}
      </div>


      <div class="testimonial-author">

        <div
          class="author-avatar ${accentClass}"
          aria-hidden="true">
          ${icon}
        </div>

        <div>

          <div class="author-name">
            ${name}
          </div>

          ${
            grade
              ? `
                <div class="author-grade">
                  ${grade}
                </div>
              `
              : ""
          }

        </div>

      </div>

    </article>
  `;
}


/* ------------------------------------------------------
   SHOW EMPTY MESSAGE
------------------------------------------------------ */

function showPublicTestimonialsMessage(
  grid,
  message
) {
  grid.innerHTML = `
    <div
      class="public-testimonials-empty"
      style="
        grid-column:1/-1;
        color:var(--ivory-dim);
        font-size:13px;
      ">
      ${escapePublicTestimonialText(
        message
      )}
    </div>
  `;
}


/* ------------------------------------------------------
   CONNECT LIVE PUBLIC TESTIMONIALS
------------------------------------------------------ */

function connectPublicTestimonials() {
  const grid =
    document.getElementById(
      "public-testimonials-grid"
    );


  if (!grid) {
    return;
  }


  const testimonialQuery =
    query(
      collection(
        db,
        "testimonials"
      ),

      where(
        "status",
        "==",
        "active"
      )
    );


  onSnapshot(
    testimonialQuery,

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


      if (
        testimonials.length ===
        0
      ) {
        showPublicTestimonialsMessage(
          grid,
          "Student testimonials will appear here."
        );

        return;
      }


      grid.innerHTML =
        testimonials
          .map(
            createPublicTestimonialCard
          )
          .join("");
    },

    function (error) {
      console.error(
        "Public testimonials could not be loaded:",
        error
      );


      showPublicTestimonialsMessage(
        grid,
        "Testimonials could not be loaded."
      );
    }
  );
}


/* ------------------------------------------------------
   START PUBLIC TESTIMONIALS
------------------------------------------------------ */

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    connectPublicTestimonials
  );

} else {
  connectPublicTestimonials();
}