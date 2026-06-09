from pathlib import Path
import re
import shutil

# ---------------------------------------------------------
# SETTINGS
# ---------------------------------------------------------

SOURCE_FILE = Path("bat8.html")
OUTPUT_FOLDER = Path("LMS IONYVERSE")


# ---------------------------------------------------------
# BASIC HELPERS
# ---------------------------------------------------------

def stop(message):
    print("\nERROR:", message)
    raise SystemExit(1)


def write_file(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n", encoding="utf-8")
    print("Created:", path)


def extract_between(text, start_text, end_text):
    start = text.find(start_text)

    if start == -1:
        stop(f"Could not find: {start_text}")

    start = start + len(start_text)

    end = text.find(end_text, start)

    if end == -1:
        stop(f"Could not find: {end_text}")

    return text[start:end]


def extract_div_by_id(html, element_id):
    """
    Extract a full <div> section, including all nested div elements.
    """

    id_position = html.find(f'id="{element_id}"')

    if id_position == -1:
        stop(f'Could not find element with id="{element_id}"')

    div_start = html.rfind("<div", 0, id_position)

    if div_start == -1:
        stop(f'Could not locate opening div for id="{element_id}"')

    tag_pattern = re.compile(r"<div\b[^>]*>|</div\s*>", re.IGNORECASE)

    depth = 0

    for match in tag_pattern.finditer(html, div_start):
        token = match.group(0).lower()

        if token.startswith("<div") and not token.startswith("</div"):
            depth += 1
        else:
            depth -= 1

        if depth == 0:
            return html[div_start:match.end()]

    stop(f'Could not find closing div for id="{element_id}"')


def extract_div_by_class(html, class_name):
    """
    Extract the first full <div> containing the requested class.
    """

    pattern = re.compile(
        rf'<div[^>]*class="[^"]*\b{re.escape(class_name)}\b[^"]*"[^>]*>',
        re.IGNORECASE
    )

    match = pattern.search(html)

    if not match:
        stop(f'Could not find class="{class_name}"')

    div_start = match.start()

    tag_pattern = re.compile(r"<div\b[^>]*>|</div\s*>", re.IGNORECASE)

    depth = 0

    for token_match in tag_pattern.finditer(html, div_start):
        token = token_match.group(0).lower()

        if token.startswith("<div") and not token.startswith("</div"):
            depth += 1
        else:
            depth -= 1

        if depth == 0:
            return html[div_start:token_match.end()]

    stop(f'Could not find closing div for class="{class_name}"')


def make_page_active(fragment):
    """
    Make an extracted page visible after separation.
    """

    fragment = fragment.replace(
        'class="page-view active"',
        'class="page-view"',
        1
    )

    fragment = fragment.replace(
        'class="page-view"',
        'class="page-view active"',
        1
    )

    return fragment


# ---------------------------------------------------------
# SHARED HTML
# ---------------------------------------------------------

def shared_nav():
    return """
<!-- NAVIGATION BAR -->
<nav>
  <div class="nav-logo" onclick="window.location.href='./index.html'">
    Browse <span>A</span> Teacher
  </div>

  <ul class="nav-links">
    <li><a href="./index.html#landing">Home</a></li>
    <li><a href="./index.html#courses">Courses</a></li>
    <li><a href="./index.html#consult">Consult</a></li>
  </ul>

  <div class="nav-cta">
    <button class="btn-ghost"
      onclick="window.location.href='./student.html'">
      Login
    </button>

    <button class="btn-primary"
      onclick="window.location.href='./index.html#landing'">
      Get Started
    </button>
  </div>
</nav>
"""


def shared_tabs(active_tab):
    def active(name):
        return " active" if active_tab == name else ""

    return f"""
<!-- PAGE TABS -->
<div class="page-tabs">
  <button class="tab-btn{active("landing")}"
    onclick="showTab('landing')">
    Landing
  </button>

  <button class="tab-btn{active("courses")}"
    onclick="showTab('courses')">
    Course Library
  </button>

  <button class="tab-btn{active("consult")}"
    onclick="showTab('consult')">
    Consultation
  </button>

  <button class="tab-btn{active("student")}"
    onclick="showTab('student')">
    Login
  </button>

  <button class="tab-btn{active("admin")}"
    onclick="showTab('admin')">
    Admin Login
  </button>
</div>
"""


def html_document(title, active_tab, body_content, extra_scripts=""):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <meta name="viewport"
    content="width=device-width, initial-scale=1.0">

  <title>{title}</title>

  <link
    href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&family=Caveat:wght@400;600&display=swap"
    rel="stylesheet">

  <link rel="stylesheet" href="./css/style.css">
</head>

<body>

{shared_nav()}

{shared_tabs(active_tab)}

{body_content}

<script src="./js/common.js"></script>

{extra_scripts}

</body>
</html>
"""


# ---------------------------------------------------------
# READ ORIGINAL HTML
# ---------------------------------------------------------

if not SOURCE_FILE.exists():
    stop(
        "bat8.html was not found. Place split_bat.py beside your "
        "original bat8.html file."
    )

original_html = SOURCE_FILE.read_text(encoding="utf-8")

print("\nReading original file:", SOURCE_FILE)


# ---------------------------------------------------------
# EXTRACT CSS
# ---------------------------------------------------------

css_content = extract_between(
    original_html,
    "<style>",
    "</style>"
)


# ---------------------------------------------------------
# EXTRACT ORIGINAL JAVASCRIPT
# ---------------------------------------------------------

inline_scripts = re.findall(
    r"<script(?:\s[^>]*)?>(.*?)</script>",
    original_html,
    flags=re.IGNORECASE | re.DOTALL
)

if inline_scripts:
    original_javascript = inline_scripts[-1]
else:
    original_javascript = ""


# Prevent errors when a separated page does not contain a modal.
# Example:
# document.getElementById('video-modal').addEventListener(...)
# becomes:
# document.getElementById('video-modal')?.addEventListener(...)

original_javascript = re.sub(
    r"""document\.getElementById\((['"])(.*?)\1\)\.addEventListener""",
    lambda match:
        f"""document.getElementById('{match.group(2)}')?.addEventListener""",
    original_javascript
)


# ---------------------------------------------------------
# EXTRACT ORIGINAL PAGE SECTIONS
# ---------------------------------------------------------

landing_page = extract_div_by_id(original_html, "page-landing")
courses_page = extract_div_by_id(original_html, "page-courses")
consult_page = extract_div_by_id(original_html, "page-consult")
student_page = extract_div_by_id(original_html, "page-student")
admin_page = extract_div_by_id(original_html, "page-admin")

whatsapp_float = extract_div_by_class(original_html, "wa-float")
video_modal = extract_div_by_id(original_html, "video-modal")
pdf_modal = extract_div_by_id(original_html, "pdf-modal")


# ---------------------------------------------------------
# BUILD PUBLIC HOME PAGE
# ---------------------------------------------------------

public_content = f"""
<!-- ===== LANDING PAGE ===== -->
{landing_page}

<!-- ===== COURSE LIBRARY ===== -->
{courses_page}

<!-- ===== CONSULTATION PAGE ===== -->
{consult_page}

<!-- ===== WHATSAPP BUTTON ===== -->
{whatsapp_float}

<!-- ===== VIDEO MODAL ===== -->
{video_modal}

<!-- ===== PDF MODAL ===== -->
{pdf_modal}
"""


# ---------------------------------------------------------
# BUILD STUDENT PAGE
# ---------------------------------------------------------

student_content = f"""
<!-- ===== Login AND DASHBOARD ===== -->
{make_page_active(student_page)}

<!-- ===== WHATSAPP BUTTON ===== -->
{whatsapp_float}
"""


# ---------------------------------------------------------
# BUILD ADMIN PAGE
# ---------------------------------------------------------

admin_content = f"""
<!-- ===== ADMIN LOGIN AND DASHBOARD ===== -->
{make_page_active(admin_page)}
"""


# ---------------------------------------------------------
# SHARED JAVASCRIPT
# ---------------------------------------------------------

navigation_javascript = r"""

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
"""


common_javascript = original_javascript + navigation_javascript


# ---------------------------------------------------------
# FIREBASE PLACEHOLDER
# ---------------------------------------------------------

firebase_placeholder = """/*
  FIREBASE CONNECTION FILE

  Do not add passwords inside this file.

  Later, paste your Firebase web configuration here.
*/

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import { getAuth } from
  "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import { getFirestore } from
  "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import { getStorage } from
  "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";


const firebaseConfig = {
  apiKey: "PASTE_YOUR_FIREBASE_API_KEY",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
"""


student_javascript = """/*
  STUDENT FIREBASE FUNCTIONS WILL GO HERE.

  Next functions to implement:

  1. Firebase Login
  2. Student logout
  3. Load student courses
  4. Load videos
  5. Send PDF requests
  6. Load approved PDFs
  7. Send consultation requests
  8. Display approved consultation sessions

  The current prototype Login remains available
  through common.js until Firebase is connected.
*/
"""


admin_javascript = """/*
  ADMIN FIREBASE FUNCTIONS WILL GO HERE.

  Next functions to implement:

  1. Firebase admin login
  2. Admin logout
  3. Register students
  4. Suspend students
  5. Remove students
  6. Upload PDFs
  7. Add video links
  8. Approve PDF requests
  9. Approve consultation requests
  10. Load dashboard statistics

  The current prototype admin login remains available
  through common.js until Firebase is connected.
*/
"""


readme_content = """BROWSE A TEACHER LMS
====================

This folder was created from the original bat8.html file.

FILES
-----

public/index.html
    Public website:
    - Landing page
    - Course library
    - Consultation page
    - WhatsApp button
    - Video modal
    - PDF modal

public/student.html
    Login and student dashboard.

public/admin.html
    Admin login and admin dashboard.

public/css/style.css
    Original shared website styling.

public/js/common.js
    Original shared JavaScript and separated-page navigation.

public/js/firebase-config.js
    Firebase configuration placeholder.

public/js/student.js
    Future Firebase student functions.

public/js/admin.js
    Future Firebase admin functions.

backup/bat8-original-backup.html
    Untouched backup of your original website file.


IMPORTANT
---------

Do not delete the backup file.

The current login forms are still prototype login forms.
Firebase Authentication must be connected next.

Replace the placeholder WhatsApp number:
94XXXXXXXXX

with the real WhatsApp business number before deployment.
"""


# ---------------------------------------------------------
# CREATE OUTPUT FOLDER
# ---------------------------------------------------------

if OUTPUT_FOLDER.exists():
    shutil.rmtree(OUTPUT_FOLDER)

(OUTPUT_FOLDER / "public" / "css").mkdir(parents=True, exist_ok=True)
(OUTPUT_FOLDER / "public" / "js").mkdir(parents=True, exist_ok=True)
(OUTPUT_FOLDER / "backup").mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------
# WRITE ALL FILES
# ---------------------------------------------------------

write_file(
    OUTPUT_FOLDER / "public" / "index.html",
    html_document(
        title="Browse A Teacher",
        active_tab="landing",
        body_content=public_content
    )
)

write_file(
    OUTPUT_FOLDER / "public" / "student.html",
    html_document(
        title="Student Portal | Browse A Teacher",
        active_tab="student",
        body_content=student_content,
        extra_scripts='<script src="./js/student.js"></script>'
    )
)

write_file(
    OUTPUT_FOLDER / "public" / "admin.html",
    html_document(
        title="Admin Portal | Browse A Teacher",
        active_tab="admin",
        body_content=admin_content,
        extra_scripts='<script src="./js/admin.js"></script>'
    )
)

write_file(
    OUTPUT_FOLDER / "public" / "css" / "style.css",
    css_content
)

write_file(
    OUTPUT_FOLDER / "public" / "js" / "common.js",
    common_javascript
)

write_file(
    OUTPUT_FOLDER / "public" / "js" / "firebase-config.js",
    firebase_placeholder
)

write_file(
    OUTPUT_FOLDER / "public" / "js" / "student.js",
    student_javascript
)

write_file(
    OUTPUT_FOLDER / "public" / "js" / "admin.js",
    admin_javascript
)

write_file(
    OUTPUT_FOLDER / "README-FIRST.txt",
    readme_content
)

shutil.copy2(
    SOURCE_FILE,
    OUTPUT_FOLDER / "backup" / "bat8-original-backup.html"
)

print(
    "Created:",
    OUTPUT_FOLDER / "backup" / "bat8-original-backup.html"
)


# ---------------------------------------------------------
# FINAL MESSAGE
# ---------------------------------------------------------

print("\n--------------------------------------------")
print("DONE")
print("--------------------------------------------")
print("\nYour separated LMS folder is ready:")
print(OUTPUT_FOLDER.resolve())

print("\nOpen this file first:")
print((OUTPUT_FOLDER / "public" / "index.html").resolve())

print("\nYour original website backup is here:")
print(
    (
        OUTPUT_FOLDER /
        "backup" /
        "bat8-original-backup.html"
    ).resolve()
)