/* ======================================================
   CLEAN EYE / CROSSED-EYE PASSWORD TOGGLE
====================================================== */

(function () {
  function getEyeIcon(isVisible) {
    if (isVisible) {
      return `
        <svg
          viewBox="0 0 24 24"
          class="password-toggle-icon"
          aria-hidden="true">

          <path d="M3 3l18 18"></path>

          <path
            d="M10.58 10.58
               a2 2 0 0 0 2.83 2.83">
          </path>

          <path
            d="M9.88 4.24
               A10.8 10.8 0 0 1 12 4
               c5.5 0 9 5.5 9 5.5
               a16.1 16.1 0 0 1-3.27 3.74">
          </path>

          <path
            d="M6.61 6.61
               A16.8 16.8 0 0 0 3 9.5
               S6.5 15 12 15
               a10.9 10.9 0 0 0 2.12-.21">
          </path>

        </svg>
      `;
    }

    return `
      <svg
        viewBox="0 0 24 24"
        class="password-toggle-icon"
        aria-hidden="true">

        <path
          d="M3 12
             s3.5-5.5 9-5.5
             9 5.5 9 5.5
             -3.5 5.5-9 5.5
             S3 12 3 12Z">
        </path>

        <circle
          cx="12"
          cy="12"
          r="2.4">
        </circle>

      </svg>
    `;
  }


  function addToggle(input) {
    if (
      !input ||
      input.dataset.eyeToggleReady === "true"
    ) {
      return;
    }

    input.dataset.eyeToggleReady = "true";

    let wrapper = input.closest(".password-field-wrap");

    if (!wrapper) {
      wrapper = document.createElement("div");

      wrapper.className = "password-field-wrap";

      input.parentNode.insertBefore(
        wrapper,
        input
      );

      wrapper.appendChild(input);
    }


    const button = document.createElement("button");

    button.type = "button";
    button.className = "password-toggle-btn";
    button.innerHTML = getEyeIcon(false);

    button.setAttribute(
      "aria-label",
      "Show password"
    );

    button.setAttribute(
      "title",
      "Show password"
    );


    button.addEventListener(
      "click",
      function () {
        const shouldShow =
          input.type === "password";

        input.type =
          shouldShow
            ? "text"
            : "password";

        button.innerHTML =
          getEyeIcon(shouldShow);

        button.classList.toggle(
          "is-visible",
          shouldShow
        );

        button.setAttribute(
          "aria-label",
          shouldShow
            ? "Hide password"
            : "Show password"
        );

        button.setAttribute(
          "title",
          shouldShow
            ? "Hide password"
            : "Show password"
        );
      }
    );


    wrapper.appendChild(button);
  }


  function scanPasswordInputs() {
    document
      .querySelectorAll('input[type="password"]')
      .forEach(addToggle);
  }


  document.addEventListener(
    "DOMContentLoaded",
    function () {
      scanPasswordInputs();

      const observer =
        new MutationObserver(
          scanPasswordInputs
        );

      observer.observe(
        document.body,
        {
          childList: true,
          subtree: true
        }
      );
    }
  );
})();
