# Valve

`custom:kachelwerk-valve` · for `valve`, `switch`, `input_boolean`, `cover`

![Valve cards](../screenshots/valve.png#only-light)
![Valve cards](../screenshots/valve-dark.png#only-dark)

Things that open and close: a name, a status line and buttons below.

## Using it

- **Valve** (`valve`): open, close and stop.
- **Irrigation** (a `switch`): water running or closed.
- **Window drive** (a `cover`, e.g. a skylight): open, close, stop, with its position.

## Options

| Option | Default | |
| --- | --- | --- |
| `entity` | required | The entity the card shows. |
| `name` |  | Shown instead of the entity's name. |
| `effects` | `subtle` | Glow and motion: `off`, `subtle` or `strong`. See [Look and feel](../appearance.md#effects). |

All options can be set in the visual editor too.

```yaml
type: custom:kachelwerk-valve
entity: valve.main_water
```

## What it calls

`valve.open_valve`, `valve.close_valve`, `valve.stop_valve`; `homeassistant.turn_on` / `turn_off`; `cover.open_cover`, `cover.close_cover`, `cover.stop_cover`.
