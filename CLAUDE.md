# Notes for Claude

Kachelwerk brings the tiles of MUI (https://github.com/firsttris/ccu-addon-mui)
to Home Assistant as Lovelace cards. The tiles keep MUI's look and logic;
only the data comes from HA entities instead of CCU datapoints.

## How a card is built

- `src/cards/<card>/<Tile>.tsx`: the tile as in MUI's `src/controls/`, with
  neutral props (values and callbacks) instead of a CCU channel. Port it
  from MUI with as few changes as possible, so fixes can move both ways.
- `src/cards/<card>/<domain>Model.ts`: pure functions from a HA entity to
  the tile's props and from the tile's actions to a service call, with
  unit tests next to it.
- `src/cards/<card>/<Tile>Card.tsx`: the HA side, reads `hass.states`,
  calls services (`useCallService`), opens more-info (`useMoreInfo`).
- `src/main.ts` registers it with `defineCard` (custom element, card
  picker, visual editor schema).

Base HA details (attributes, services, feature flags) on Home Assistant's
sources (`homeassistant/components/<domain>/`), not on memory, and name the
file where it settles a detail.

## Stack

Preact (not React: same code as MUI at a fraction of the size), Tailwind 4
in each card's shadow root (`src/ha/styles.ts` registers Tailwind's
`@property` rules on the document), Lucide icons via unplugin-icons. The
build is one file, `dist/kachelwerk.js`.

## Checking a change

- `npm run typecheck`, `npm test` (vitest), `npm run build`
- `npm run test:e2e`: every card on the demo page clicked through
  (`tests/cards.spec.ts`); add a test there for a new card's controls.
- `npm run screenshots`: `docs/screenshots/<card>.png` and `-dark.png` in
  English (`tests/screenshots.spec.ts`); CI commits them after a push to main.
- `npm run animations` (needs ffmpeg): `docs/animations/<card>.webp`, a
  scene per card in `tests/animations.spec.ts`, dark; the README's gallery
  and the docs show them. By hand (workflow "Update animations").
- `node scripts/shots.mjs [width] [lang] [cards]`: quick screenshots of the
  demo page (`demo/`, a fake hass with the entities in `demo/examples.ts`;
  URL parameters `only`, `ids`, `theme`, `lang`, `width`). Look at narrow
  widths too (540 is a card of ~255 px, as in a 4-column sections view).

A new card: its examples in `demo/examples.ts` (English names in
`demo/english.ts`), a line in `SHOTS` of `tests/screenshots.spec.ts` and a scene in
`tests/animations.spec.ts`, a page
in `docs/cards/` and the nav of `mkdocs.yml`, a row in both READMEs.

## Language

Commit messages in German. README.md, the docs (`docs/`, mkdocs-material on
GitHub Pages) and code comments in English; README.de.md in German. Texts of
the tiles in `src/i18n/messages.ts`, German and English, with MUI's keys and
wording; the editor's labels in `src/i18n/fields.ts`.

## Code style

As in MUI: functional, not object-oriented (custom elements are the one
class HA requires), pure functions, function tables instead of long
`switch`es. A file does one thing; split by domain past ~400 lines, a
component past ~150.
