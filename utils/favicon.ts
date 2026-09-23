/** The sprite lifts out of this tab on its way to the studio.
 *
 *  The mirror of the studio's arrival animation, which slides the same
 *  sprite *down* into its tab a moment later. Together they read as one
 *  movement across two tabs — which only means anything because both apps
 *  are the same origin, so the handover is real rather than mimed.
 *
 *  What lifts is whatever is already in the tab: Header.tsx renders the
 *  current sprite into the favicon with html2canvas, so reusing that image
 *  keeps the thing that leaves identical to the thing that was there.
 *
 *  Timers rather than requestAnimationFrame — the same reason as the
 *  studio's copy: rAF is paused in a tab that isn't being composited, and
 *  a tab losing focus mid-send is exactly the case worth surviving.
 *
 *  Driven by elapsed time rather than a frame count, for the same reason
 *  again: a background tab clamps timers to about one tick a second, so
 *  sleeping SLIDE_MS/FRAMES eight times turned a half-second animation into
 *  eight seconds. Reading the clock keeps the duration fixed and lets the
 *  frame rate be whatever the tab can manage. */

const SIZE = 64;
const SLIDE_MS = 500;
/** How often to *try* to draw. What lands depends on the tab. */
const FRAME_MS = 60;

/** cubic-bezier(0.215, 0.610, 0.355, 1) — the studio's easing, solved in
 *  JS because this is canvas rather than CSS. No closed form exists for t
 *  given x, so it takes the few Newton-Raphson passes a browser would. */
const cubicBezier = (x1: number, y1: number, x2: number, y2: number) => {
  const a = (p: number, q: number) => 1 - 3 * q + 3 * p;
  const b = (p: number, q: number) => 3 * q - 6 * p;
  const c = (p: number) => 3 * p;
  const at = (t: number, p: number, q: number) => ((a(p, q) * t + b(p, q)) * t + c(p)) * t;
  const slope = (t: number, p: number, q: number) => 3 * a(p, q) * t * t + 2 * b(p, q) * t + c(p);
  return (x: number): number => {
    let t = x;
    for (let i = 0; i < 5; i++) {
      const d = slope(t, x1, x2);
      if (d === 0) break;
      t -= (at(t, x1, x2) - x) / d;
    }
    return at(t, y1, y2);
  };
};

const easeOut = cubicBezier(0.215, 0.61, 0.355, 1);
/** Run the same curve backwards, so leaving accelerates exactly as
 *  arriving decelerates — the two halves mirror instead of both easing the
 *  same way, which would look like a stutter. */
const easeIn = (t: number) => 1 - easeOut(1 - t);

const loadImage = (src: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

/** Lift the tab's icon up and out, then put it back. Resolves when the
 *  animation is over, so the caller can time what happens next. */
export const animateSpriteDeparture = async (): Promise<void> => {
  // Re-queried every time rather than held: the <link> lives in next/head,
  // which replaces the element on re-render. Holding a reference would mean
  // painting frames onto a node no longer in the document.
  const icon = () => document.getElementById("favicon") as HTMLLinkElement | null;
  const original = icon()?.href;
  // Nothing rendered into the favicon yet — skip rather than animate a
  // blank square out of the tab.
  if (!original || !original.startsWith("data:")) return;

  const art = await loadImage(original);
  if (!art) return;

  const set = (href: string) => {
    const el = icon();
    if (el) el.href = href;
  };

  const started = performance.now();
  for (;;) {
    const progress = Math.min(1, (performance.now() - started) / SLIDE_MS);
    const eased = easeIn(progress);
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) break;
    ctx.imageSmoothingEnabled = false;
    // Rises a full icon-height and fades as it goes: the exact inverse of
    // the studio's arrival.
    ctx.globalAlpha = 1 - eased;
    ctx.drawImage(art, 0, -SIZE * eased, SIZE, SIZE);
    set(canvas.toDataURL("image/png"));
    if (progress >= 1) break;
    await new Promise((r) => window.setTimeout(r, FRAME_MS));
  }

  // Back to the sprite, so the tab looks like itself again. This also
  // repairs the icon after a re-render has blanked it: the JSX <link> in
  // each page carries no href, so next/head restores it empty whenever the
  // page re-renders, throwing away what Header painted there.
  set(original);
};
