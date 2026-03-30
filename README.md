## Miko

Pixel art editor with frame animation. Share sprites via URL.

![Image showing editor](https://bardhovde.com/assets/miko.png)

Blog post: [bardhovde.com/posts/miko](https://bardhovde.com/posts/miko/)
Live site: [mikoapp.netlify.app](https://mikoapp.netlify.app/)

```bash
npm install
npm run dev
# http://localhost:3000
```

## Stack

- **Next.js 15** — App Router, `app/` directory
- **Zustand** — state via `stores/sprite`, `stores/sheet`, `stores/drawing`, `stores/package`
- **TypeScript 5** — strict mode, `noUncheckedIndexedAccess`

## Structure

```
app/
  editor/sprite/   Sprite editor
  editor/sheet/    Spritesheet editor
  editor/package/  Package editor
  share/           View + share a sprite from URL
lib/
  encoding/        Hash format, URL compression
  storage.ts       localStorage helpers
stores/            Zustand stores
components/        UI components
```

## Sprite format

Sprites are encoded as strings where each character maps to a palette index (`charCode - 97`, `'a'` = transparent). A frame for an 11×11 sprite is 121 characters. Multiple frames form an animation.

Sprites can be compressed into a URL query parameter (`?d=...`) using `lib/encoding/url.ts`.
