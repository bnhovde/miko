/**
 * The paint app's Worker. Almost everything here is a plain static file
 * from `next export`; this script exists for one case those files can't
 * cover.
 *
 * Next's optional catch-all routes export as a single template file —
 * `/app/editor/sprite/[[...spriteId]].html` — rather than one file per id,
 * because the ids are made at runtime and live in the browser. So
 * `/app/editor/sprite` resolves, but opening or refreshing
 * `/app/editor/sprite/abc123` hits a path with no file behind it and 404s.
 * In-app navigation never noticed (Next routes those on the client); a
 * refresh in the editor did.
 *
 * Serving the template for those paths hands the client router the URL and
 * lets it pick the id back out, which is what a refresh needs.
 */

/** Route prefixes whose deeper paths are client-side ids, and the exported
 *  template that should answer for them. Mirrors pages/app/editor/*. */
const CATCH_ALL: { prefix: string; template: string }[] = [
  { prefix: "/app/editor/sprite", template: "/app/editor/sprite/[[...spriteId]].html" },
  { prefix: "/app/editor/sheet", template: "/app/editor/sheet/[[...sheetId]].html" },
  { prefix: "/app/editor/package", template: "/app/editor/package/[[...packageId]].html" },
];

export interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const direct = await env.ASSETS.fetch(request);
    if (direct.status !== 404) return direct;

    // The bare prefix needs this too, not just deeper paths: the exported
    // file is literally `[[...spriteId]].html`, and nothing maps
    // /app/editor/sprite onto it either.
    const route = CATCH_ALL.find(
      (r) => url.pathname === r.prefix || url.pathname.startsWith(`${r.prefix}/`)
    );
    if (!route) return direct;

    const template = new URL(route.template, url.origin);
    const page = await env.ASSETS.fetch(new Request(template, { headers: request.headers }));
    // Serve it as this URL rather than redirecting: the id in the path is
    // the thing the client router reads, so it has to survive.
    return new Response(page.body, { status: page.status, headers: page.headers });
  },
};
