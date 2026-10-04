# Bird Life — MVP specification

## Core concept

A lightweight virtual bird-raising game. The player repeatedly raises individual birds. When one bird's life ends, a new egg appears and hatches into a bird with a different appearance.

Game over is therefore a **generation transition**, not a complete reset.

## Current state

Each bird has three values from 0 to 100:

- Hunger (おなか)
- Happiness (ごきげん)
- Energy (げんき)

Actions:

- Food: hunger +25, happiness +3
- Play: happiness +24, energy -10, hunger -6
- Sleep: energy +30, hunger -8
- Advance 3 hours: hunger -18, happiness -12, energy -13

When any status reaches zero, the current generation ends.

## Generation system

After game over:

1. The current bird remains in the collection.
2. A new egg appears.
3. The player hatches the egg.
4. A bird different from the immediately previous bird is selected.
5. Status values restart at 70.

Current prototype bird variants use emoji placeholders. Original artwork should replace these later.

## Product direction

A future version should make appearance depend partly on care history rather than pure randomness. Possible examples:

- lots of play → colorful / energetic bird
- lots of sleep → fluffy bird
- balanced care → special bird
- exceptional care → rare bird

This makes each generation a collectible result of the player's behavior.

## Technical direction

The first version is deliberately dependency-free HTML/CSS/JavaScript and suitable for GitHub Pages.

Near-term priorities:

1. Persist state with local storage.
2. Use real elapsed time instead of the manual +3 hours button.
3. Add egg/chick/adult growth stages.
4. Add original visual assets.
5. Add a proper collection/encyclopedia.
6. Consider PWA installation after the gameplay loop is stable.
