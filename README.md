# Cumhuriyet Cup · Horse Racing Simulator

A horse racing simulator built with Vue 3, TypeScript and Pinia for the Insider One Frontend Developer assessment. Twenty horses, a six-round programme from 1,200 m to 2,200 m, animated races and round-by-round results.

**Live demo:** https://badblli.github.io/horse-racing-game/

Cumhuriyet Cup is an independent, fictional simulator inspired by Türkiye's Cumhuriyet Koşusu. It is not affiliated with or endorsed by the Turkish Jockey Club (TJK) and uses none of its branding. Race rules follow the assessment brief, not the real race.

## Features

- A roster of 20 horses, each with a name, a unique color and a condition from 1 to 100, generated at startup
- **Generate schedule** draws ten horses for each of six rounds: 1,200, 1,400, 1,600, 1,800, 2,000 and 2,200 m
- **Start race** runs the rounds one at a time; the horses gallop along their lanes and overtake one another
- **Pause** and **Resume** freeze and continue the race mid-stride
- Results appear as each round finishes; a round picker opens earlier results
- The schedule shows each round's state and expands to its lineup; the roster shows who runs in the current round and in which lane
- Responsive layout for desktop, tablet and mobile, with a tabbed detail view and a bottom action bar on phones
- Keyboard and screen reader support: labelled regions, an ARIA tablist on mobile, and a polite live region for race milestones

## Tech stack

- Vue 3 (Composition API, `<script setup>`) and TypeScript in strict mode
- Pinia setup stores
- Vite
- Vitest and Vue Test Utils for unit and component tests
- Playwright for end-to-end tests
- ESLint, oxlint and Prettier
- GitHub Actions for CI and a manual GitHub Pages deployment

No UI library is used; the design tokens and components are written for this project.

## Getting started

Requires Node.js 24 LTS (see `.nvmrc`); `^22.18.0` also works.

```sh
npm install
npm run dev
```

To run the end-to-end tests the first time, install the Playwright browser:

```sh
npx playwright install chromium
npm run test:e2e
```

## Scripts

| Command                   | Description                                                   |
| ------------------------- | ------------------------------------------------------------- |
| `npm run dev`             | Start the development server                                  |
| `npm run build`           | Type-check and build for production                           |
| `npm run preview`         | Serve the production build locally                            |
| `npm run validate`        | Lint, check formatting, run unit tests and build              |
| `npm run test:unit`       | Run unit and component tests once with Vitest                 |
| `npm run test:unit:watch` | Run unit and component tests in watch mode                    |
| `npm run test:e2e`        | Build the test bundle and run the Playwright end-to-end tests |
| `npm run type-check`      | Type-check with vue-tsc                                       |
| `npm run lint`            | Lint with oxlint and ESLint                                   |
| `npm run lint:fix`        | Lint and apply automatic fixes                                |
| `npm run format`          | Format the source and test files with Prettier                |

## Architecture

The application uses a lightweight feature-based architecture. Horses, scheduling and racing each live in their own module, so related models, state, components and tests are colocated and most changes stay within one module. Dependencies point in one direction, from race to schedule to horses, and lint rules enforce it. Shared code is extracted only when more than one feature uses it, which keeps the structure in proportion to the size of the project while leaving room for new features.

```
src/
├─ app/                 App shell: layout, header, mobile tabs, runtime options, design tokens
├─ features/
│  ├─ race/             Simulation, lifecycle, race store, race clock, stage, track, results
│  ├─ schedule/         Six-round schedule and the schedule panel
│  └─ horses/           Roster generation, horses store, horse figure, roster table
└─ shared/              Seeded random utilities, formatters, color contrast, base components
```

```
app → race → schedule → horses → shared
```

- Each layer may import only from layers to its right. ESLint `no-restricted-imports` rules fail the lint when a module imports upwards, and relative imports that climb out of a module (`../../`) are not allowed; cross-module imports use the `@/` alias.
- Models are plain TypeScript functions with no Vue dependency, so the rules of the race are unit-tested without mounting anything.
- Components hold no business rules. They receive data through props or read a store, and they emit events; what an action is allowed to do is decided by the store and the lifecycle.

## Simulation

**Random generation.** At startup the app selects 20 names without replacement from a curated pool of 36 natural racehorse names, assigns each a unique color from a 20-color palette in random order, and gives each an integer condition between 1 and 100. Choosing meaningful names at random keeps every roster readable while still varying from session to session. Each horse has a stable ID independent of its name and keeps its name, color and condition for the whole programme.

All randomness comes from a seeded generator (Mulberry32) with separate streams for the roster, each schedule and each round, so a seed reproduces the same data in tests. Production uses a random seed per session.

**Rounds are decided up front.** When a schedule is generated, every round is simulated at once. Each horse's speed comes from its condition (condition 1 runs about 10% slower than condition 100) and its form on the day (±5%). The race is split into 100 m segments, each run at its own pace (±6%), so horses can overtake and the leader changes during a round. The result is a list of checkpoint times per horse; playback only reads it, so pausing or redrawing can never change who wins. In seeded runs the horse with the best condition wins about four rounds in ten.

**Playback.** One `requestAnimationFrame` loop (`useRaceClock`) advances race time while the race is running, at ten race seconds per real second, so a 1,200 m round takes about seven seconds on screen. Frame steps are capped, so a background tab does not make the horses jump. Each horse is positioned with a CSS `transform` from its distance at the current time. When the last horse crosses the line the result is committed once, the finished round stays on the track for 2.5 seconds, and the next round starts.

## State management

- **`horses` store:** the frozen roster and a lookup by ID. It is generated once per session.
- **`race` store:** the session seed, the lifecycle state, the schedule, the precomputed simulations and the committed results, plus derived state such as each round's status, the winners, each horse's lane in the current round and the action the controls may offer.

The lifecycle is a pure transition function over five states:

```
idle ──generate──► ready ──start──► running ──pause──► paused ──resume──► running
                                      │
                                      └── after round 6 ──► finished
```

`generate` is accepted from `idle`, `ready`, `paused` and `finished`, and starts a new schedule over the same horses. An action that is not allowed in the current state is ignored and changes nothing. The controls ask the same transition table what they may show, so the buttons can never offer an action the store would reject.

## Testing

- **Unit and component tests (Vitest):** random utilities, formatters and color contrast; roster, schedule and simulation rules, including determinism per seed and that a better condition wins more often; the lifecycle and the race store; the race clock with a fake frame source; and the components' behaviour through their rendered output.
- **End-to-end tests (Playwright, Chromium):** the full flow from twenty horses to all six results in order, and that pause freezes the horses and resume carries on.

The end-to-end tests run against a separate test build (`vite build --mode e2e`) that reads `?seed=` and `?rate=` from the URL, so every run sees the same horses and plays a round in about two seconds. The production build ignores both parameters.

**CI** runs on every push to `main` and on pull requests: lint, formatting, type-check, unit tests, build and end-to-end tests. **Deployment** to GitHub Pages is a separate workflow that is started by hand; it validates, builds with the `/horse-racing-game/` base path and publishes.

## Design decisions

The interface is deliberately quiet. The race track is the only large element; the current round, distance and state are stated once, in the title and a single status sentence. Lineups, earlier results and the full roster are one click away through progressive disclosure, instead of competing with the live race. The palette is a warm light neutral with one burgundy accent, reserved for the primary action, the current round and the winner.

- Every horse color is shown next to a number or a name, never on its own, and each color chip picks dark or white text for contrast.
- On phones the lanes show only the number chip and a lane key under the track names every runner. Schedule, Results and Horses share a tab control, and the controls move to a bar fixed to the bottom of the screen.
- With reduced motion enabled, the horses do not gallop; they still move along the track.

## Assumptions

- There are always 20 horses: the brief asks for 20, and "1 to 20" is read as the list's numbering.
- "Randomly generated" means a random roster built from meaningful names, colors and conditions, not random strings.
- The roster is generated once per session; Generate creates a new schedule over the same horses.
- A horse may run in several rounds. Condition sets base speed and does not change between rounds.
- Start and Pause share one control, as in the brief's example. Generate is locked while a round is running and starts over when used while paused or finished.
- Ties break on finish time, then lane.

## Known limitations

- Reloading the page starts a new session with a new roster; nothing is stored.
- End-to-end tests run in Chromium only.
- There is a single light theme.
- Visual regression tests are not included yet.

## AI-assisted development

This project was built with the help of an AI coding assistant (Claude Code); I directed the plan and design, and reviewed, tested and approved every change before committing it.
