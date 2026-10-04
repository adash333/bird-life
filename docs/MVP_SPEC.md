# Bird Life — MVP specification

## Core concept

A lightweight virtual bird-raising game. Birds grow from eggs into adults, and healthy adult birds can lay eggs. Parents remain in the flock, so the bird family can gradually grow.

## Growth cycle

1. Egg: 0–5 hours
2. Chick: 6–17 hours
3. Young bird: 18–35 hours
4. Adult: 36+ hours
5. A healthy adult can lay an egg

The current prototype advances time manually in 3-hour steps.

## Status

Each bird has three values from 0 to 100:

- Hunger (おなか)
- Happiness (ごきげん)
- Energy (げんき)

Actions:

- Food: hunger +25, happiness +3
- Play: happiness +24, energy -10, hunger -6
- Sleep: energy +30, hunger -8
- Advance 3 hours: hunger -10, happiness -6, energy -7

If any status reaches zero, that individual bird's life ends. Other birds continue living.

## Egg laying and family growth

An adult bird lays one egg when hunger, happiness, and energy are all at least 55 during a time advance.

The parent remains in the flock. The egg is added as a new individual and can be selected and raised separately.

For the MVP, each adult lays one egg.

## Inheritance and variation

A child currently has:

- 55% chance to inherit the parent's bird variant
- 45% chance to become a different variant

This is a simple placeholder genetics system. Future versions can independently inherit color, pattern, body shape, clothing, and rare traits.

## Product direction

The main loop is now:

**raise → grow → adult → lay egg → family grows → raise the next generation**

The collection is not merely a historical encyclopedia: living parents and children coexist as a flock.

## Technical direction

The MVP remains dependency-free HTML/CSS/JavaScript and suitable for GitHub Pages.

Near-term priorities:

1. Persist flock and status with local storage.
2. Use real elapsed time instead of the manual +3 hours button.
3. Improve breeding/inheritance rules.
4. Add original bird artwork with visible colors and patterns.
5. Add a family tree / encyclopedia.
6. Add egg incubation and hatching interactions.
7. Consider PWA installation after the gameplay loop is stable.
