# Bird Life 🐣

A simple virtual bird-raising game where birds grow, lay eggs, and gradually build a family.

## 🎮 Play the MVP

**GitHub Pages:** https://adash333.github.io/bird-life/

Open the link above on a phone or computer to play the latest version.

## Requirements

See [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) (要件定義書) for the full, up-to-date requirements.

## Current MVP

Bird Life is a small browser-based virtual pet game inspired by classic pet-raising games.

- Warm an egg until it hatches
- Raise a chick into a young bird and then an adult
- Feed, play with, and let each bird sleep
- Hunger, happiness, and energy change over time
- Healthy adult birds can lay eggs
- Parents remain in the flock, so the family grows
- Children may inherit the parent's type or hatch as a different type
- Switch between birds and care for them individually
- Progress and the flock are saved in the browser with localStorage

## Growth loop

**🥚 Egg → 🐣 Chick → 🐤 Young bird → 🐦 Adult → 🥚 Egg**

Eggs hatch after being warmed three times.

## Run locally

No build step is required. Open `index.html` in a browser.

## Code layout

| File | Role |
| --- | --- |
| `index.html` | Page skeleton; loads the files below in order and shows any error on screen |
| `style.css` | All styles |
| `js/state.js` | Shared game state and small helpers |
| `js/birds.js` | Bird data: colors/patterns, names, growth stages |
| `js/birdArt.js` | Bird pictures (SVG) per growth stage |
| `js/sound.js` | Sound effects (Web Audio API) |
| `js/save.js` | Save / load with localStorage |
| `js/rules.js` | Game rules: care, time, falling asleep / revive, egg laying |
| `js/ui.js` | Drawing the world, panels, family list and notices |
| `js/main.js` | Button handlers and game start (loaded last) |

## Tests

```sh
npm install
npm test      # syntax check + automated play-through in a real browser (phone and desktop sizes)
npm run format
```

GitHub Actions runs `npm test` on every push (`.github/workflows/test.yml`). A red ✗ on a commit means the game is broken.

## Next ideas

- Real-time status decay
- More colors, patterns, clothes, and rare birds
- Richer inheritance / genetics
- Family tree and bird encyclopedia
- Original bird artwork and animations
- Sound effects
- PWA installation

## Status

Early playable MVP.
