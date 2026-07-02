# Cat Game — built just for fun

A tiny React + Vite game where you move a cat around a cozy room. Using Matter.js, plant pots are physical objects: bump them to tip them over; a new one drops from the top. I made this for fun and to practice canvas drawing and basic 2D physics.

Repository: https://github.com/agnieszkaskubiszewska/cat_game

## Gameplay
- You have 60 seconds.
- Up to 20 pots appear (one after another).
- Hit a pot with the cat to tip it and score a point.
- Pots can land on shelves — you can still knock them off.
- After tipping, the pot disappears and the next one drops in.

## Controls
- Arrow keys or WASD — move the cat.

## Tech stack
- React + Vite
- Canvas 2D (background, room elements, HUD)
- Matter.js (physics bodies: cat, walls, pots, shelves; collision handling)

## Run locally
```bash
npm install
npm run dev
```
Open the URL shown in the terminal (usually `http://localhost:5173`).

## Structure
- `src/components/Game.jsx` — game loop, rendering, physics.
- `src/App.jsx` — app entry wiring.
- `src/App.css` — basic styles.

## Notes
- Canvas uses its own coordinate system; Matter.js updates body positions and the frame draws their current state every tick.
- Pots spawn at random X and “fall”; when hit by the cat they get a spin impulse, then after a short delay they’re counted and despawned.
- HUD shows current score and remaining time.

Have fun! 🙂 I built this just for fun and learning.