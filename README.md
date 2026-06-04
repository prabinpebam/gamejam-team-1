# Game Jam Team 1

Repository for **Game Jam Team 1** in the Mini Game Jam. 🎮

## Run it

No build step required — it's plain HTML/JS/CSS.

- Double-click `index.html`, **or**
- Serve locally for the smoothest experience:
  ```bash
  npx serve .
  # or
  python -m http.server 8000
  ```
  then open the printed URL.

## Controls

- **Move:** Arrow keys or `WASD`
- **Pause:** `P`

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page + canvas markup |
| `styles.css` | Styling |
| `game.js` | Game loop (start here!) |

## Make it yours

`game.js` contains a minimal `requestAnimationFrame` loop moving a square. Replace the
`update()` and `draw()` functions with your own game. Good luck, and have fun!
