# Buttons

`custom:kachelwerk-buttons` · for `button`, `input_button`, `script`, `scene`, `automation`, `event`

![Buttons cards](../screenshots/buttons.png#only-light)
![Buttons cards](../screenshots/buttons-dark.png#only-dark)

Several keys in one tile, like a wall switch or a remote: tap for a short press, hold for a long one.

## Using it

- Buttons are pressed, scripts and scenes run, automations are triggered.
- A key with `hold` runs that entity on a long press; the bar at the bottom fills while you hold.
- An `event` entity lights its key up whenever it is pressed at the device.
- The title is what all key names share ("Hallway switch" for "Hallway switch up" and "… down").

## Options

| Option | Default | |
| --- | --- | --- |
| `entity` | required | The entity the card shows. |
| `name` |  | Shown instead of the entity's name. |
| `entities` |  | More keys: entity ids, or `entity`, `name` and `hold` each. |
| `effects` | `subtle` | Glow and motion: `off`, `subtle` or `strong`. See [Look and feel](../appearance.md#effects). |

All options can be set in the visual editor too.

```yaml
type: custom:kachelwerk-buttons
entity: script.good_night
entities:
  - entity: script.good_morning
    hold: script.all_off
  - scene.movie_night
```

## What it calls

`button.press`, `input_button.press`, `script.turn_on`, `scene.turn_on`, `automation.trigger`.
