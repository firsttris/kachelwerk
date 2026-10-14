# Development

```sh
npm install
npm run dev            # the demo page with example entities (demo/), http://localhost:4210
npm test               # unit tests (vitest)
npm run test:e2e       # the cards clicked through in a browser (Playwright)
npm run build          # dist/kachelwerk.js
npm run screenshots    # docs/screenshots, light and dark
npm run animations     # docs/animations, the moving pictures (needs ffmpeg)
```

## How a card is built

- `src/cards/<card>/<Tile>.tsx`: the tile as in ccu-addon-mui's `src/controls/`, with neutral props (values and
  callbacks) instead of a CCU channel. Ported with as few changes as possible, so fixes move both ways.
- `src/cards/<card>/<domain>Model.ts`: pure functions from a Home Assistant entity to the tile's props,
  and from the tile's actions to a service call, with unit tests beside them.
- `src/cards/<card>/<Tile>Card.tsx`: the Home Assistant side: reads `hass.states`, calls services, opens
  more-info.
- `src/main.ts` registers it with `defineCard`: the custom element, the card picker, the visual editor.

## Stack

Preact with `preact/compat` (ccu-addon-mui's React code at a fraction of the size), Tailwind 4 in each card's shadow
root (`src/ha/styles.ts` puts Tailwind's `@property` rules and the font on the document), Lucide icons,
one file built by Vite.

## The demo page

`demo/` renders every card with a fake `hass` whose services change the entities as Home Assistant
would. URL parameters: `only=light,thermostat`, `ids=cover.kueche,…`, `theme=light|dark`, `lang=en`,
`width=540` (a narrow section).

## Screenshots and animations

`tests/screenshots.spec.ts` takes a still of every card, light and dark; the **Update screenshots**
workflow takes them anew after every change on main. `tests/animations.spec.ts` plays a short scene
per card (state changes as Home Assistant reports them, taps on buttons), records it with Chrome's
screencast and joins the frames with ffmpeg into an animated WebP, as ccu-addon-mui's tile pictures.
They change on every run, so **Update animations** runs by hand only;
`ANIMATIONS=shutter,light npm run animations` takes some of them.

## Releases

**Actions → Bump version** raises the version in `package.json`, tags it and starts the release, which
attaches `kachelwerk.js` to the GitHub release that HACS installs.
