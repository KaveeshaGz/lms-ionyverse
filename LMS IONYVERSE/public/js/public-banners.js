/* ======================================================
   PUBLIC FIREBASE BANNER ADVERTISEMENTS
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


/* ------------------------------------------------------
   SAFE TEXT OUTPUT
------------------------------------------------------ */

function escapePublicBannerText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* ------------------------------------------------------
   CREATE RIGHT-SIDE COURSE LIBRARY BANNER AREA
------------------------------------------------------ */

function ensurePublicBannerLayout() {
  const courseSection =
    document.querySelector(
      "#page-courses > section"
    );


  if (!courseSection) {
    console.error(
      "Public Course Library section was not found."
    );

    return null;
  }


  let layout =
    document.getElementById(
      "public-course-layout"
    );


  if (layout) {
    return {
      layout:
        layout,

      sidebar:
        document.getElementById(
          "public-banner-sidebar"
        ),

      list:
        document.getElementById(
          "public-banner-list"
        )
    };
  }


  layout =
    document.createElement("div");

  layout.id =
    "public-course-layout";

  layout.className =
    "public-course-layout no-banners";


  const mainContent =
    document.createElement("div");

  mainContent.className =
    "public-course-main";


  /*
    Move the existing Course Library content into
    the left-side main area.
  */
  while (
    courseSection.firstChild
  ) {
    mainContent.appendChild(
      courseSection.firstChild
    );
  }


  const sidebar =
    document.createElement("aside");

  sidebar.id =
    "public-banner-sidebar";

  sidebar.className =
    "public-banner-sidebar";

  sidebar.hidden =
    true;


  sidebar.innerHTML = `
    <div class="public-banner-sidebar-head">

      <div class="section-label">
        Featured Classes ✦
      </div>

      <div class="public-banner-sidebar-title">
        Teacher Advertisements
      </div>

    </div>


    <div
      id="public-banner-list"
      class="public-banner-list">
    </div>
  `;


  layout.appendChild(
    mainContent
  );

  layout.appendChild(
    sidebar
  );

  courseSection.appendChild(
    layout
  );


  return {
    layout:
      layout,

    sidebar:
      sidebar,

    list:
      document.getElementById(
        "public-banner-list"
      )
  };
}


/* ------------------------------------------------------
   LOAD ACTIVE FIREBASE BANNERS
------------------------------------------------------ */

async function loadPublicBanners() {
  const elements =
    ensurePublicBannerLayout();


  if (
    !elements ||
    !elements.layout ||
    !elements.sidebar ||
    !elements.list
  ) {
    return;
  }


  const {
    layout,
    sidebar,
    list
  } = elements;


  try {
    const bannerQuery =
      query(
        collection(
          db,
          "banners"
        ),

        where(
          "status",
          "==",
          "active"
        )
      );


    const snapshot =
      await getDocs(
        bannerQuery
      );


    const banners = [];


    snapshot.forEach(
      function (bannerDocument) {
        banners.push({
          id:
            bannerDocument.id,

          ...bannerDocument.data()
        });
      }
    );


    banners.sort(
      function (
        firstBanner,
        secondBanner
      ) {
        const firstTime =
          firstBanner
            .createdAt
            ?.seconds || 0;

        const secondTime =
          secondBanner
            .createdAt
            ?.seconds || 0;

        return (
          secondTime -
          firstTime
        );
      }
    );


    /*
      Hide the entire right-side area when there
      are no active banners.
    */
    if (
      banners.length === 0
    ) {
      sidebar.hidden =
        true;

      layout.classList.add(
        "no-banners"
      );

      list.innerHTML =
        "";

      return;
    }


    sidebar.hidden =
      false;

    layout.classList.remove(
      "no-banners"
    );


    list.innerHTML =
      banners
        .map(
          function (banner) {
            const title =
              escapePublicBannerText(
                banner.title ||
                "Teacher Advertisement"
              );


            const imageUrl =
              escapePublicBannerText(
                banner.imageUrl
              );


            const link =
              String(
                banner.link || ""
              ).trim();


            const hasSecureLink =
              link.startsWith(
                "https://"
              );


            const bannerContent = `
              <img
                class="public-banner-image"
                src="${imageUrl}"
                alt="${title}">

              <div class="public-banner-caption">
                ${title}
              </div>
            `;


            if (
              hasSecureLink
            ) {
              return `
                <a
                  class="public-banner-card"
                  href="${escapePublicBannerText(
                    link
                  )}"
                  target="_blank"
                  rel="noopener noreferrer sponsored">

                  ${bannerContent}

                </a>
              `;
            }


            return `
              <article
                class="public-banner-card">

                ${bannerContent}

              </article>
            `;
          }
        )
        .join("");


  } catch (error) {
    console.error(
      "Could not load public banners:",
      error
    );


    sidebar.hidden =
      true;

    layout.classList.add(
      "no-banners"
    );
  }
}


/*
  Allows manual refreshing from the browser
  Console while testing.
*/
window.loadPublicBanners =
  loadPublicBanners;


/* ------------------------------------------------------
   START PUBLIC FIREBASE BANNERS
------------------------------------------------------ */

function startPublicBanners() {
  loadPublicBanners();
}


if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    startPublicBanners
  );

} else {
  startPublicBanners();
}