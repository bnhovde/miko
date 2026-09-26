/** Moving between the apps that share mikro.games.
 *
 *  Each app names its own tab (`window.name`), so opening another app finds
 *  that app's tab if one is already open instead of piling up new ones —
 *  and leaves it where it was, rather than reloading away whatever is being
 *  edited in it. The studio does the same with the same names (its
 *  src/apps.ts); keep the two in step. */

export const STUDIO_WINDOW = "mikro-studio";
export const PAINT_WINDOW = "mikro-paint";

/** Plain paths, not Next routes: these are other apps on the same origin,
 *  outside this app's `/paint` basePath. */
export const STUDIO_URL = "/studio/";
export const SITE_URL = "/";

/** Brings up the named app's tab, opening it at `url` only if it isn't
 *  open yet. Falls back to navigating this tab when popups are blocked. */
export const openApp = (url: string, name: string) => {
  const win = window.open("", name);
  if (!win) {
    window.location.href = url;
    return;
  }
  // A fresh named window starts blank; an existing one keeps its page.
  if (win.location.href === "about:blank") win.location.href = url;
  win.focus();
};
