/* ======================================================
   WEBSITE CONTACT SETTINGS
====================================================== */

const BAT_WHATSAPP_NUMBER =
  "94707655385";

function showTab(name){
  document.querySelectorAll('.page-view').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  const tabs=['landing','courses','consult','student','admin'];
  const idx=tabs.indexOf(name);
  document.getElementById('page-'+name).classList.add('active');
  if(idx>=0) document.querySelectorAll('.tab-btn')[idx].classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}
function toggleFaq(el){
  el.parentElement.classList.toggle('open');
}
function whatsappPurchase(course){
  const msg=encodeURIComponent('Hello Browse A Teacher. I would like to purchase the '+course+'. Please let me know the payment details. Thank you!');
  window.open('https://wa.me/940707655385?text='+msg,'_blank');
}
function whatsappConsult(){
  const msg=encodeURIComponent('Hello Browse A Teacher. I would like to book a consultation session. Please advise on availability. Thank you!');
  window.open('https://wa.me/940707655385?text='+msg,'_blank');
}
function whatsappSupport(){
  const msg=encodeURIComponent('Hello Browse A Teacher! I need some help. Could you assist me?');
  window.open('https://wa.me/940707655385?text='+msg,'_blank');
}

// Library sub-tab toggle
function switchLib(tab){
  document.getElementById('lib-videos').style.display = tab==='videos' ? 'block' : 'none';
  document.getElementById('lib-pdfs').style.display   = tab==='pdfs'   ? 'block' : 'none';
  document.getElementById('lib-tab-videos').style.cssText = tab==='videos'
    ? 'padding:12px 24px;font-size:12px;font-family:var(--mono);letter-spacing:0.06em;text-transform:uppercase;color:var(--yellow);background:none;border:none;cursor:pointer;border-bottom:2px solid var(--yellow);margin-bottom:-1px'
    : 'padding:12px 24px;font-size:12px;font-family:var(--mono);letter-spacing:0.06em;text-transform:uppercase;color:var(--gray);background:none;border:none;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px';
  document.getElementById('lib-tab-pdfs').style.cssText = tab==='pdfs'
    ? 'padding:12px 24px;font-size:12px;font-family:var(--mono);letter-spacing:0.06em;text-transform:uppercase;color:var(--yellow);background:none;border:none;cursor:pointer;border-bottom:2px solid var(--yellow);margin-bottom:-1px'
    : 'padding:12px 24px;font-size:12px;font-family:var(--mono);letter-spacing:0.06em;text-transform:uppercase;color:var(--gray);background:none;border:none;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px';

const activeSubjectButton =
  document.querySelector(
    ".public-subject-filter.active"
  );

if (activeSubjectButton) {
  window.filterPublicLibrarySubject(
    activeSubjectButton.dataset
      .librarySubject,
    activeSubjectButton
  );
}

  }

// Video Modal
function openVideoModal(title, teacher, subject){
  document.getElementById('vmodal-title').textContent   = title;
  document.getElementById('vmodal-teacher').textContent = teacher;
  document.getElementById('vmodal-subject').textContent = subject;
  const durations = ['14:22','09:45','18:03','11:38','13:57','16:10'];
  document.getElementById('vmodal-dur').textContent = durations[Math.floor(Math.random()*durations.length)];
  const m = document.getElementById('video-modal');
  m.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function closeVideoModal(){
  document.getElementById('video-modal').style.display = 'none';
  document.body.style.overflow = '';
}
document.getElementById('video-modal')?.addEventListener('click', function(e){
  if(e.target===this) closeVideoModal();
});

// PDF Modal
let _currentPdf = {};
function openPdfModal(title, teacher, price, subject){
  _currentPdf = {title, teacher, price, subject};
  document.getElementById('modal-title').textContent   = title;
  document.getElementById('modal-teacher').textContent = teacher;
  document.getElementById('modal-price').textContent   = price;
  document.getElementById('modal-subject').textContent = subject;
  const m = document.getElementById('pdf-modal');
  m.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function closePdfModal(){
  document.getElementById('pdf-modal').style.display = 'none';
  document.body.style.overflow = '';
}
function buyPdfWhatsapp(){
  const msg = encodeURIComponent('Hello Browse A Teacher. I would like to purchase the PDF: "'+_currentPdf.title+'" ('+_currentPdf.subject+', '+_currentPdf.price+'). Please advise on payment. Thank you!');
  window.open('https://wa.me/940707655385?text='+msg,'_blank');
}
document.getElementById('pdf-modal')?.addEventListener('click', function(e){
  if(e.target===this) closePdfModal();
});

// Login gate
function studentLogin(){
  const u = document.getElementById('stu-username').value.trim();
  const p = document.getElementById('stu-password').value.trim();
  if(!u || !p){ alert('Please enter your username and password.'); return; }
  // Prototype: accept any non-empty credentials
  document.getElementById('student-login-gate').style.display = 'none';
  document.getElementById('student-dashboard').style.display  = 'block';
}
function studentLogout(){
  document.getElementById('student-dashboard').style.display  = 'none';
  document.getElementById('student-login-gate').style.display = 'flex';
  document.getElementById('stu-username').value = '';
  document.getElementById('stu-password').value = '';
}

// Admin login gate
function adminLogin(){
  const u = document.getElementById('adm-username').value.trim();
  const p = document.getElementById('adm-password').value.trim();
  if(!u || !p){ alert('Please enter admin credentials.'); return; }
  document.getElementById('admin-login-gate').style.display  = 'none';
  document.getElementById('admin-dashboard').style.display   = 'block';
}
function adminLogout(){
  document.getElementById('admin-dashboard').style.display   = 'none';
  document.getElementById('admin-login-gate').style.display  = 'flex';
  document.getElementById('adm-username').value = '';
  document.getElementById('adm-password').value = '';
}

const d=new Date();
const el=document.getElementById('live-date');
if(el) el.textContent=d.toLocaleDateString('en-GB',{weekday:'long',day:'2-digit',month:'short',year:'numeric'});


// =========================================================
// SEPARATED PAGE NAVIGATION
// =========================================================

window.showTab = function(tabName) {

  const localPage = document.getElementById("page-" + tabName);

  // If the requested section exists in the current HTML page,
  // show it without leaving the page.
  if (localPage) {

    document.querySelectorAll(".page-view").forEach(function(page) {
      page.classList.remove("active");
    });

    localPage.classList.add("active");

    document.querySelectorAll(".tab-btn").forEach(function(button) {
      button.classList.remove("active");
    });

    const publicTabs = ["landing", "courses", "notes", "consult"];

    if (publicTabs.includes(tabName)) {
      window.history.replaceState(null, "", "#" + tabName);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    return;
  }

  // If the requested page is not inside the current file,
  // go to the correct separated HTML file.
  if (tabName === "student") {
    window.location.href = "./student.html";
    return;
  }

  if (tabName === "admin") {
    window.location.href = "./admin.html";
    return;
  }

  if (
  tabName === "landing" ||
  tabName === "courses" ||
  tabName === "notes" ||
  tabName === "consult"
) {
    window.location.href = "./index.html#" + tabName;
  }
};


// Open the correct public section when index.html contains a hash.
// Examples:
// index.html#courses
// index.html#consult

document.addEventListener("DOMContentLoaded", function() {

  const section = window.location.hash.replace("#", "");

  if (
    section === "landing" ||
    section === "courses" ||
    section === "consult"
  ) {
    window.showTab(section);
  }
});
window.showTab = function (tabName) {
  const targetPage = document.getElementById("page-" + tabName);

  if (!targetPage) {
    console.error("Page not found:", "page-" + tabName);
    return;
  }

  document.querySelectorAll(".page-view").forEach(function (page) {
    page.classList.remove("active");
  });

  targetPage.classList.add("active");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};

/* =========================================================
   PUBLIC PAGE SECTION NAVIGATION
   ========================================================= */

window.openPublicSection = function (sectionName) {
  const target = document.getElementById("page-" + sectionName);

  if (!target) {
    window.location.href = "./index.html#" + sectionName;
    return;
  }

  document.querySelectorAll(".page-view").forEach(function (page) {
    page.classList.remove("active");
  });

  target.classList.add("active");

  window.history.replaceState(null, "", "#" + sectionName);

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};

document.addEventListener("DOMContentLoaded", function () {
  const sectionName = window.location.hash.replace("#", "");

  if (
  sectionName === "landing" ||
  sectionName === "courses" ||
  sectionName === "notes" ||
  sectionName === "consult"
) {
  window.openPublicSection(sectionName);
}
});

function whatsappTeacherAd(teacherName, className) {
  const message = encodeURIComponent(
    "Hello Browse A Teacher. I am interested in the " +
    className +
    " advertised by " +
    teacherName +
    ". Please send me more details. Thank you!"
  );

  window.open(
    "https://wa.me/940707655385?text=" + message,
    "_blank"
  );
}



/* ======================================================
   PUBLIC NOTES PAGE
   Temporary localStorage version.
   Firebase will replace this later.
====================================================== */

const STUDY_NOTES_STORAGE_KEY = "browseATeacherStudyNotes";


/* Default notes shown before the admin uploads anything */
const defaultStudyNotes = [];


/* Read notes from browser storage */
window.getStudyNotes = function () {
  try {
    const storedNotes = localStorage.getItem(
      STUDY_NOTES_STORAGE_KEY
    );

    if (!storedNotes) {
      localStorage.setItem(
        STUDY_NOTES_STORAGE_KEY,
        JSON.stringify(defaultStudyNotes)
      );

      return [...defaultStudyNotes];
    }

    return JSON.parse(storedNotes);
  } catch (error) {
    console.error("Could not read study notes:", error);

    return [...defaultStudyNotes];
  }
};


/* Save notes and refresh the public page */
window.saveStudyNotes = function (notes) {
  localStorage.setItem(
    STUDY_NOTES_STORAGE_KEY,
    JSON.stringify(notes)
  );

  window.renderPublicStudyNotes();
};


/* Safely display text entered by admin */
function escapeStudyNoteText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* Make subject text look neat */
function formatStudyNoteSubject(subject) {
  const safeSubject = String(subject || "");

  return safeSubject.charAt(0).toUpperCase() +
    safeSubject.slice(1);
}


/* Draw the notes on the public Notes page */
window.renderPublicStudyNotes = function () {
  const grid = document.querySelector(".notes-grid");

  if (!grid) {
    return;
  }

  const activeNotes = window
    .getStudyNotes()
    .filter(function (note) {
      return note.active !== false;
    });

  if (activeNotes.length === 0) {
    grid.innerHTML = `
      <div style="
        grid-column:1/-1;
        border:1px solid var(--ivory-border);
        border-radius:var(--radius);
        padding:32px;
        color:var(--ivory-dim);
        text-align:center;
      ">
        No study notes are available yet.
      </div>
    `;

    return;
  }

  grid.innerHTML = activeNotes
    .map(function (note) {
      return `
        <div
          class="note-card"
          data-subject="${escapeStudyNoteText(note.subject)}">

          <img
            class="note-image"
            src="${escapeStudyNoteText(note.imageUrl)}"
            alt="${escapeStudyNoteText(note.title)}">

          <div class="note-body">

            <div class="note-subject">
              ${escapeStudyNoteText(
                formatStudyNoteSubject(note.subject)
              )}
            </div>

            <div class="note-title">
              ${escapeStudyNoteText(note.title)}
            </div>

            <p class="note-description">
              ${escapeStudyNoteText(note.description)}
            </p>

            <button
              class="note-view-btn"
              data-note-id="${escapeStudyNoteText(note.id)}">
              View Note
            </button>

          </div>
        </div>
      `;
    })
    .join("");

  grid
    .querySelectorAll("[data-note-id]")
    .forEach(function (button) {
      button.addEventListener("click", function () {
        const noteId = button.dataset.noteId;

        const note = window
          .getStudyNotes()
          .find(function (item) {
            return item.id === noteId;
          });

        if (!note) {
          return;
        }

        window.openNoteImage(
          note.imageUrl,
          note.title
        );
      });
    });
};


/* Filter notes by subject */
window.filterNotes = function (subject, clickedButton) {
  const buttons = document.querySelectorAll(
    ".notes-filter-btn"
  );

  const cards = document.querySelectorAll(".note-card");

  buttons.forEach(function (button) {
    button.classList.remove("active");
  });

  clickedButton.classList.add("active");

  cards.forEach(function (card) {
    const cardSubject = card.dataset.subject;

    if (
      subject === "all" ||
      cardSubject === subject
    ) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
};


/* Open the large note image popup */
window.openNoteImage = function (imageUrl, title) {
  const modal = document.getElementById("note-modal");
  const image = document.getElementById("note-modal-image");
  const titleText = document.getElementById(
    "note-modal-title"
  );

  if (!modal || !image || !titleText) {
    return;
  }

  image.src = imageUrl;
  image.alt = title;
  titleText.textContent = title;

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
};


/* Close popup */
window.closeNoteImage = function () {
  const modal = document.getElementById("note-modal");

  if (!modal) {
    return;
  }

  modal.style.display = "none";
  document.body.style.overflow = "";
};


/* Show stored notes when public page opens */
document.addEventListener(
  "DOMContentLoaded",
  function () {
    window.renderPublicStudyNotes();
  }
);

/* ======================================================
   PUBLIC MOBILE NAVIGATION
====================================================== */

window.togglePublicMobileNav =
  function () {
    const menu =
      document.getElementById(
        "public-mobile-nav"
      );

    const toggle =
      document.getElementById(
        "public-nav-toggle"
      );

    if (!menu || !toggle) {
      return;
    }

    const isOpen =
      menu.classList.toggle("open");

    toggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    toggle.textContent =
      isOpen ? "×" : "☰";
  };


window.closePublicMobileNav =
  function () {
    const menu =
      document.getElementById(
        "public-mobile-nav"
      );

    const toggle =
      document.getElementById(
        "public-nav-toggle"
      );

    if (!menu || !toggle) {
      return;
    }

    menu.classList.remove("open");

    toggle.setAttribute(
      "aria-expanded",
      "false"
    );

    toggle.textContent = "☰";
  };


document.addEventListener(
  "click",
  function (event) {
    const menu =
      document.getElementById(
        "public-mobile-nav"
      );

    const toggle =
      document.getElementById(
        "public-nav-toggle"
      );

    if (!menu || !toggle) {
      return;
    }

    const clickedInsideMenu =
      menu.contains(event.target);

    const clickedToggle =
      toggle.contains(event.target);

    if (
      !clickedInsideMenu &&
      !clickedToggle
    ) {
      window.closePublicMobileNav();
    }
  }
);


document.addEventListener(
  "keydown",
  function (event) {
    if (event.key === "Escape") {
      window.closePublicMobileNav();
    }
  }
);


window.addEventListener(
  "resize",
  function () {
    if (window.innerWidth > 920) {
      window.closePublicMobileNav();
    }
  }
);

/* ======================================================
   PUBLIC COURSE LIBRARY SUBJECT FILTERS
====================================================== */

window.filterPublicLibrarySubject =
  function (
    selectedSubject,
    clickedButton
  ) {
    const subject =
      String(
        selectedSubject || "all"
      )
        .trim()
        .toLowerCase();


    /*
      Update the selected button design.
    */
    document
      .querySelectorAll(
        ".public-subject-filter"
      )
      .forEach(function (button) {
        button.classList.remove(
          "active"
        );
      });


    if (clickedButton) {
      clickedButton.classList.add(
        "active"
      );
    }


    /*
      Filter both:
      - Video Course cards
      - PDF Resource cards

      Existing cards are detected using
      their visible subject text.
    */
    const libraryCards =
      document.querySelectorAll(
        "#lib-videos .course-card, " +
        "#lib-pdfs .course-card"
      );


    libraryCards.forEach(
      function (card) {
        const cardText =
          card.textContent
            .trim()
            .toLowerCase();


        const shouldShow =
          subject === "all" ||
          cardText.includes(
            subject
          );


        card.style.display =
          shouldShow
            ? ""
            : "none";
      }
    );


    /*
      Show a friendly message if a subject
      does not currently have uploaded items.
    */
    updatePublicLibraryEmptyMessage(
      subject
    );
  };


/* ------------------------------------------------------
   DISPLAY EMPTY SUBJECT MESSAGE
------------------------------------------------------ */

function updatePublicLibraryEmptyMessage(
  selectedSubject
) {
  const activeLibrary =
    document.getElementById(
      "lib-videos"
    )?.style.display === "none"
      ? document.getElementById(
          "lib-pdfs"
        )
      : document.getElementById(
          "lib-videos"
        );


  if (!activeLibrary) {
    return;
  }


  let emptyMessage =
    document.getElementById(
      "public-library-empty-message"
    );


  if (!emptyMessage) {
    emptyMessage =
      document.createElement(
        "div"
      );

    emptyMessage.id =
      "public-library-empty-message";

    emptyMessage.className =
      "public-library-empty-message";

    activeLibrary.appendChild(
      emptyMessage
    );
  }


  /*
    Move the message into the currently
    selected Videos or PDFs tab.
  */
  if (
    emptyMessage.parentElement !==
    activeLibrary
  ) {
    activeLibrary.appendChild(
      emptyMessage
    );
  }


  const visibleCards =
    activeLibrary.querySelectorAll(
      ".course-card:not([style*='display: none'])"
    );


  if (visibleCards.length > 0) {
    emptyMessage.style.display =
      "none";

    return;
  }


  const label =
    selectedSubject === "all"
      ? "this section"
      : selectedSubject.replace(
          /\b\w/g,
          function (letter) {
            return letter.toUpperCase();
          }
        );


  emptyMessage.textContent =
    "No resources are available for " +
    label +
    " yet.";


  emptyMessage.style.display =
    "block";
}


