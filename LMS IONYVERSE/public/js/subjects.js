/* ======================================================
   LMS SUBJECT CONFIGURATION
   Add new subjects here later when required.
====================================================== */

window.LMS_SUBJECTS = [
  {
    label: "Business Studies",
    value: "Business Studies",
    slug: "business studies"
  },

  {
    label: "Chemistry",
    value: "Chemistry",
    slug: "chemistry"
  }
];


/*
  Create dropdown options.

  useSlug: true
  Used by Study Notes filters because notes currently
  save lowercase subject values such as "chemistry".
*/
window.getLmsSubjectOptions = function (
  options
) {
  const settings =
    options || {};

  const useSlug =
    settings.useSlug === true;

  const includeAll =
    settings.includeAll === true;

  const includePlaceholder =
    settings.includePlaceholder === true;


  let html = "";


  if (includePlaceholder) {
    html += `
      <option value="">
        Select a subject
      </option>
    `;
  }


  if (includeAll) {
    html += `
      <option value="all">
        All Subjects
      </option>
    `;
  }


  html += window.LMS_SUBJECTS
    .map(function (subject) {
      const value =
        useSlug
          ? subject.slug
          : subject.value;

      return `
        <option value="${value}">
          ${subject.label}
        </option>
      `;
    })
    .join("");


  return html;
};


/*
  Client-side validation helper.
*/
window.isAllowedLmsSubject =
  function (subject) {
    return window.LMS_SUBJECTS
      .some(function (item) {
        return (
          item.value === subject ||
          item.slug === subject
        );
      });
  };