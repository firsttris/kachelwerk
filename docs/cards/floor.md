# Floor heating

`custom:kachelwerk-floor` · for `number`, `sensor`, `input_number`, `switch`, `binary_sensor`

![Floor heating: floor in motion](../animations/floor.webp){ width="480" }

One floor heating circuit: the heating loop in the screed fills with warm water as far as its valve is open, warmer and faster the further open, and heat rises off the floor.

## Using it

- A valve opening in percent (0–100) or as a fraction (0–1).
- A `switch` or `binary_sensor` shows the pump (or another output) with waves while it runs, and a switch where it can be switched.

## Options

| Option | Default | |
| --- | --- | --- |
| `entity` | required | The entity the card shows. |
| `name` |  | Shown instead of the entity's name. |
| `output` | `false` | For a switch: an output, not a pump. |
| `dew_point_entity` |  | A dew point or humidity alarm, shown as an alarm on the pump. |
| `effects` | `subtle` | Glow and motion: `off`, `subtle` or `strong`. See [Look and feel](../appearance.md#effects). |

All options can be set in the visual editor too.

```yaml
type: custom:kachelwerk-floor
entity: number.floor_heating_living_room_level
name: Living room 1
```

## What it calls

`switch.turn_on` / `switch.turn_off` for the pump.

## Light and dark

![Floor heating cards](../screenshots/floor.png#only-light)
![Floor heating cards](../screenshots/floor-dark.png#only-dark)
