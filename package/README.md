# @boxworld/miko

An embeddable pixel-sprite editor for the **miko** sprite format — a palette
plus char-per-pixel frame strings, the same shape used by the
[boxworld](https://www.npmjs.com/package/@boxworld/engine) engine and the
[miko](https://github.com/bnhovde/miko) paint tool.

Zero runtime dependencies beyond React (a peer dependency). No backend, no
storage, no opinions about your app — it reports every committed edit through
`onChange` and lets you decide what that means.

## Three ways in

**The whole editor, one component:**

```tsx
import { Miko } from "@boxworld/miko";

<Miko value={sprite} onChange={(next) => save(next)} />;
```

**Composed yourself,** when you want your own layout, or only some of it:

```tsx
import {
  MikoProvider, MikoCanvas, MikoToolbar, MikoPalette, MikoTimeline, MikoPreview,
} from "@boxworld/miko";

<MikoProvider value={sprite} onChange={save}>
  <header><MikoToolbar /><MikoPalette editable /></header>
  <main><MikoCanvas cellSize={24} /><MikoPreview size={128} /></main>
  <footer><MikoTimeline /></footer>
</MikoProvider>;
```

**Headless,** when you want none of the markup:

```tsx
import { useMiko } from "@boxworld/miko";

const {
  sprite, cells, hash, frame, palette, color, tool, canUndo,
  startDrawing, draw, endDrawing, setColor, setTool,
  addFrame, deleteFrame, setFrame, reorderFrames,
  loadSprite, undo, redo,
} = useMiko({ value: sprite, onChange: save });
```

`<Miko>` is nothing but `MikoProvider` around a default arrangement of those
same public components, so there is only ever one code path.

## How state works

`value` is read once, on mount. It is deliberately **not** a controlled prop —
a parent storing `onChange`'s output back into it would fight the user's own
edits. To open a different sprite, call `loadSprite(next)` (or remount with a
`key`).

`onChange` fires when an edit is **committed** — the end of a brush stroke, a
frame added, a colour changed — never mid-stroke. Read `sprite` from the hook
if you need the in-progress state.

Two palettes are in play, and the distinction matters: `colors` is the set of
paintable swatches (normalised so transparent and black are always present,
padded to 10), while `sprite.palette` is the sprite's own encoding palette,
holding only colours actually used in its frames and compacted by usage on
every commit.

## Undo

History is per-frame — switching frames clears it, which is what a frame-based
animator expects. `undo`/`redo` step through it, and `canUndo`/`canRedo` say
whether they'll do anything.

## Theming

Everything renders with inline styles, so there is no stylesheet to import and
none to fight. Colours come from CSS custom properties with sensible
fallbacks:

```css
:root {
  --miko-grid-line: #ccc;
  --miko-line: #999;
  --miko-selected: #333;
  --miko-active-bg: #eee;
  --miko-bg: #fff;
  --miko-text: #000;
  --miko-checker: #e8e8e8;
  --miko-font: 14px/1.4 system-ui, sans-serif;
}
```

Every component also takes `className` and `style` if you'd rather restyle
them outright.

## Pure helpers

`floodFill`, `updateHash`, `optimiseFrames`, `normalisePalette`,
`getHashArray`, `getDefaultHash`, `getRandomPalette` and friends are exported
as plain functions over a pixel hash string — no React involved — along with
`mikoReducer` itself, if you want to drive the state machine your own way.

## Develop

```bash
npm install
npm run typecheck
npm test
npm run build   # esbuild bundle + tsc declarations -> dist/
```

Note that `react` and `@types/react` are deliberately absent from
`devDependencies`. React is a peer dependency, and a second copy of either
the runtime or its types breaks hook identity and JSX type identity for the
host app. This package is developed inside the [miko](https://github.com/bnhovde/miko)
repo, where both come from the root install; the build marks `react`
external and the tests are pure functions, so nothing here needs its own.
