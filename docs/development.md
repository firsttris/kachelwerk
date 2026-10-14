# Development

```sh
npm install
npm run dev            # the demo page with example entities (demo/), http://localhost:4210
npm test               # unit tests (vitest)
npm run test:e2e       # the cards clicked through in a browser (Playwright)
npm run build          # dist/kachelwerk.js
npm run screenshots    # docs/screenshots, light and dark
```

## How a card is built

- `src/cards/<card>/<Tile>.tsx`: the tile as in MUI's `src/controls/`, with neutral props (values and
  callbacks) instead of a CCU channel. Ported with as few changes as possible, so fixes move both ways.
- `src/cards/<card>/<domain>Model.ts`: pure functions from a Home Assistant entity to the tile's props,
  and from the tile's actions to a service call, with unit tests beside them.
- `src/cards/<card>/<Tile>Card.tsx`: the Home Assistant side: reads `hass.states`, calls services, opens
  more-info.
- `src/main.ts` registers it with `defineCard`: the custom element, the card picker, the visual editor.

## Stack

Preact with `preact/compat` (MUI's React code at a fraction of the size), Tailwind 4 in each card's shadow
root (`src/ha/styles.ts` puts Tailwind's `@property` rules and the font on the document), Lucide icons,
one file built by Vite.

## The demo page

`demo/` renders every card with a fake `hass` whose services change the entities as Home Assistant
would. URL parameters: `only=light,thermostat`, `ids=cover.kueche,…`, `theme=light|dark`, `lang=en`,
`width=540` (a narrow section).

## Releases

**Actions → Bump version** raises the version in `package.json`, tags it and starts the release, which
attaches `kachelwerk.js` to the GitHub release that HACS installs.
