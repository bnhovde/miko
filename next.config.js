/** @type {import('next').NextConfig} */

// The paint app is mounted at mikro.games/paint — one origin shared with
// the studio and the games site, because IndexedDB, localStorage and
// BroadcastChannel are all keyed by origin and sending sprites between the
// apps is the point. A router Worker owns that origin and strips the
// /paint prefix before handing the request here, so this Worker serves its
// own `out/` from the root; `basePath` is the other half of the deal, and
// is what makes the built HTML ask for /paint/... in the first place.
const nextConfig = {
  reactStrictMode: true,
  basePath: "/paint",
  // `next export` writes plain files with no server behind them, so the
  // image optimizer (which is a server) can't be used.
  images: { unoptimized: true },
};

module.exports = nextConfig;
