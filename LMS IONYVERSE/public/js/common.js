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
  window.open('https://wa.me/94XXXXXXXXX?text='+msg,'_blank');
}
function whatsappConsult(){
  const msg=encodeURIComponent('Hello Browse A Teacher. I would like to book a consultation session. Please advise on availability. Thank you!');
  window.open('https://wa.me/94XXXXXXXXX?text='+msg,'_blank');
}
function whatsappSupport(){
  const msg=encodeURIComponent('Hello Browse A Teacher! I need some help. Could you assist me?');
  window.open('https://wa.me/94XXXXXXXXX?text='+msg,'_blank');
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
  window.open('https://wa.me/94XXXXXXXXX?text='+msg,'_blank');
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

    const publicTabs = ["landing", "courses", "consult"];

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
    "https://wa.me/94XXXXXXXXX?text=" + message,
    "_blank"
  );
}

/* =========================================================
   COURSE LIBRARY BANNERS
   Temporary browser-storage version.
   Firebase Storage will replace this later.
   ========================================================= */

const BAT_BANNER_STORAGE_KEY = "batTeacherBanners";

function getTeacherBanners() {
  try {
    const saved = localStorage.getItem(
      BAT_BANNER_STORAGE_KEY
    );

    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Could not read banners:", error);
    return [];
  }
}

function saveTeacherBanners(banners) {
  localStorage.setItem(
    BAT_BANNER_STORAGE_KEY,
    JSON.stringify(banners)
  );

  window.dispatchEvent(
    new CustomEvent("bat-banners-updated")
  );
}

function escapeBannerText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeBannerLink(value) {
  if (!value) return "";

  try {
    const parsed = new URL(value);

    if (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:"
    ) {
      return value;
    }
  } catch (error) {
    return "";
  }

  return "";
}

/*
  Create:
  left side  = videos and PDFs
  right side = banners
*/
function createCourseBannerSidebar() {
  const courseSection = document.querySelector(
    "#page-courses section"
  );

  if (!courseSection) return;

  /*
    Prevent duplicate layouts.
  */
  if (
    document.getElementById("course-library-layout")
  ) {
    renderCourseBanners();
    return;
  }

  const heading = courseSection.querySelector(
    ".courses-header"
  );

  const layout = document.createElement("div");

  layout.id = "course-library-layout";
  layout.className =
    "course-library-layout no-banners";

  const mainColumn = document.createElement("div");

  mainColumn.className = "course-library-main";

  const sidebar = document.createElement("aside");

  sidebar.id = "teacher-banner-sidebar";
  sidebar.className = "teacher-banner-sidebar";
  sidebar.style.display = "none";

  sidebar.innerHTML = `
    <div class="teacher-banner-sidebar-head">

      <div class="teacher-banner-sidebar-label">
        ✦ Featured Classes
      </div>

      <div class="teacher-banner-sidebar-note">
        Explore classes from other educators.
      </div>

    </div>

    <div
      id="teacher-banner-list"
      class="teacher-banner-list">
    </div>
  `;

  /*
    Place the layout below the Course Library heading.
  */
  if (heading) {
    heading.insertAdjacentElement(
      "afterend",
      layout
    );
  } else {
    courseSection.appendChild(layout);
  }

  /*
    Move the existing tabs, videos and PDFs
    into the left-side column.
  */
  const elementsToMove = [];

  let currentElement = layout.nextElementSibling;

  while (currentElement) {
    elementsToMove.push(currentElement);
    currentElement =
      currentElement.nextElementSibling;
  }

  elementsToMove.forEach(function (element) {
    mainColumn.appendChild(element);
  });

  layout.appendChild(mainColumn);
  layout.appendChild(sidebar);

  renderCourseBanners();
}

function renderCourseBanners() {
  const layout = document.getElementById(
    "course-library-layout"
  );

  const sidebar = document.getElementById(
    "teacher-banner-sidebar"
  );

  const list = document.getElementById(
    "teacher-banner-list"
  );

  if (!layout || !sidebar || !list) return;

  const banners = getTeacherBanners()
    .filter(function (banner) {
      return banner.active !== false;
    });

  /*
    No advertisements:
    hide the complete right-side column.
  */
  if (banners.length === 0) {
    sidebar.style.display = "none";
    list.innerHTML = "";
    layout.classList.add("no-banners");
    return;
  }

  /*
    Advertisements exist:
    show them on the right-hand side.
  */
  sidebar.style.display = "flex";
  layout.classList.remove("no-banners");

  list.innerHTML = banners.map(function (banner) {
    const title = escapeBannerText(
      banner.title || "Sponsored Class"
    );

    const image = escapeBannerText(
      banner.image || ""
    );

    const link = safeBannerLink(
      banner.link || ""
    );

    /*
      No destination link:
      show only the image.
    */
    if (!link) {
      return `
        <div class="teacher-banner-card">

          <img
            class="teacher-banner-image"
            src="${image}"
            alt="${title}">

          <div class="teacher-banner-chip">
            Sponsored
          </div>

        </div>
      `;
    }

    /*
      Destination link exists:
      make the image clickable.
    */
    return `
      <a
        class="teacher-banner-card"
        href="${escapeBannerText(link)}"
        target="_blank"
        rel="noopener noreferrer">

        <img
          class="teacher-banner-image"
          src="${image}"
          alt="${title}">

        <div class="teacher-banner-chip">
          Sponsored
        </div>

      </a>
    `;
  }).join("");
}

  

document.addEventListener(
  "DOMContentLoaded",
  createCourseBannerSidebar
);

window.addEventListener(
  "bat-banners-updated",
  renderCourseBanners
);

window.addEventListener(
  "storage",
  renderCourseBanners
);

/*
  Make functions available to admin.js.
*/
window.getTeacherBanners = getTeacherBanners;
window.saveTeacherBanners = saveTeacherBanners;