# Installation

Kachelwerk needs Home Assistant 2025.1 or later.

## HACS

1. In HACS, open the menu (⋮) → **Custom repositories**.
2. Add `https://github.com/firsttris/kachelwerk` with the type **Dashboard**.
3. Search for **Kachelwerk**, open it and **Download**.
4. Reload the page in your browser (or clear the app's frontend cache in the companion app).

HACS adds the resource itself and shows new versions as updates.

## Manually

1. Download `kachelwerk.js` from the [latest release](https://github.com/firsttris/kachelwerk/releases/latest).
2. Copy it to `config/www/kachelwerk/kachelwerk.js`.
3. **Settings → Dashboards → ⋮ → Resources → Add resource**: URL `/local/kachelwerk/kachelwerk.js`,
   type **JavaScript module**.
4. Reload the page.

After an update, change the URL to `/local/kachelwerk/kachelwerk.js?v=2` (any new value) so browsers
load the new file.

## Adding a card

In a dashboard: **Edit → Add card**, search for **Kachelwerk**. The card picker shows every card with a
preview of one of your entities. Or in YAML:

```yaml
type: custom:kachelwerk-light
entity: light.dining_table
```

## Check that it is loaded

The browser console shows ` KACHELWERK  0.1.0 ` when the file is loaded. If a card says
`Custom element doesn't exist: kachelwerk-…`, the resource is missing or the browser still has the old
page: reload it, or clear the cache.
