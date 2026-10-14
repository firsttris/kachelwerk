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

- `npm run typecheck`, `npm test`, `npm run build`
- `node scripts/shots.mjs [width] [lang]`: screenshots of the demo page
  (`demo/`, a fake hass with the entities in `demo/examples.ts`) in both
  themes; look at them before committing a visual change.
- `node scripts/interact.mjs <entity> <button> <ms...>`: clicks a button of
  a tile and screenshots the following moments.

## Language

Commit messages, README and docs in German; comments and identifiers in the
code in English. Texts of the tiles in `src/i18n/messages.ts`, German and
English, with MUI's keys and wording.

## Code style

As in MUI: functional, not object-oriented (custom elements are the one
class HA requires), pure functions, function tables instead of long
`switch`es. A file does one thing; split by domain past ~400 lines, a
component past ~150.
