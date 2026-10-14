# Look and feel

## Theme

The cards take their colors from your Home Assistant theme:

| Theme variable | Used for |
| --- | --- |
| `--ha-card-background`, `--card-background-color` | the tile |
| `--primary-text-color`, `--secondary-text-color` | names and states |
| `--divider-color` | borders |
| `--primary-color` | switches, focus |
| `--ha-card-border-radius`, `--ha-card-border-width`, `--ha-card-box-shadow` | corners, border and shadow |

Dark mode follows Home Assistant's own dark mode, not only the browser's. In the dark, tiles get a fine
light edge at the top, as in ccu-addon-mui.

The font is [Geist](https://vercel.com/font), ccu-addon-mui's font, built into `kachelwerk.js` (latin with
umlauts); characters it lacks come from your theme's font.

## Effects

Glow and motion — the light cones, the breathing arc of a heating thermostat, waves around a detector —
can be set per card:

```yaml
effects: subtle   # off, subtle (default) or strong
```

`off` is calm and light on an old wall tablet; `strong` is for a big screen. With "reduce motion" set in
the operating system, nothing moves either way.

## Width

In a sections view every card brings its own width, which you can change under **Layout** in the card
editor:

| Card | Columns (of 12) |
| --- | --- |
| Light on/off, socket | 4 |
| Dimmer, thermostat, shutter, window, floor heating, sensors, detectors, valve, buttons | 6 |
| Color light, garage door, lock, meter | 12 |

On narrow cards the tiles rearrange: the thermostat's numbers shrink with its dial, pictures get
smaller, values move below each other.
