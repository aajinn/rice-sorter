# Rice Sorter 🍚

A timed sorting game built with Next.js and Canvas. Drag or throw rice grains into their matching bowls before time runs out.

## How to Play

- **Click** a grain to pick it up, then click a bowl to place it
- **Ctrl + Click** a grain to enter throw mode — pull back and release to fling it
- White → **WHITE** bowl, Brown → **BROWN** bowl, and so on
- Clear all grains to advance to the next level (time bonus awarded)
- Game ends when the timer hits zero

## Levels

| Level | Name | Rice Types |
|-------|------|------------|
| 1–3 | NPC / Basmati Brainrot / Mewing | White, Brown |
| 4–6 | Looksmaxxing / Rizz-otto / Doomscrolling | White, Brown, Red |
| 7–10 | Delulu / Fanum Tax / The Goon Cave / Crashout | White, Brown, Red, Black |

## Versions

| Path | Description |
|------|-------------|
| `first.html` | Original single-file HTML5 prototype (Canvas + Tailwind CDN) |
| `app/` + `components/` | Next.js app (React 19, TypeScript, Tailwind CSS v4, Canvas 2D) |

## Running

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```
