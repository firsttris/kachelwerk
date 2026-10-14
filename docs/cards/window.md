# Window

`custom:kachelwerk-window` · for `binary_sensor`, `sensor`

![Window cards](../screenshots/window.png#only-light)
![Window cards](../screenshots/window-dark.png#only-dark)

Window and door contacts and window handles as a picture: the sash tilts in at the top or swings open, fresh air drifts in.

## Using it

- A `binary_sensor` is a contact: on is open.
- A `sensor` with the states `closed`, `tilted` and `open` is a window handle; its knob turns like the real one.

## Options

| Option | Default | |
| --- | --- | --- |
| `entity` | required | The entity the card shows. |
| `name` |  | Shown instead of the entity's name. |
| `sabotage_entity` |  | A tamper contact, shown as "Tampering". |
| `effects` | `subtle` | Glow and motion: `off`, `subtle` or `strong`. See [Look and feel](../appearance.md#effects). |

All options can be set in the visual editor too.

```yaml
type: custom:kachelwerk-window
entity: binary_sensor.bathroom_window
```

## What it calls

None, the card only shows.
