/**
 * Accessibility helpers.
 */

/**
 * Watches keyboard vs. mouse usage and toggles the `body--a11y` class.
 * When active, CSS can use `.body--a11y *:focus` to show visible focus rings
 * for keyboard users without polluting mouse-driven interactions.
 */
export const outlineWatcher = (): void => {
  try {
    let previousAction = "";

    document.addEventListener("mousedown", () => {
      if (previousAction === "mousedown") return;
      document.body.classList.remove("body--a11y");
      previousAction = "mousedown";
    });

    document.addEventListener("keydown", (e) => {
      if (previousAction === "keydown" || e.key === "Escape") return;
      document.body.classList.add("body--a11y");
      previousAction = "keydown";
    });
  } catch {
    // Not critical — ignore errors in restricted environments
  }
};
