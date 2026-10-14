# Thermostat

`custom:kachelwerk-thermostat` · for `climate`

![Thermostat cards](../screenshots/thermostat.png#only-light)
![Thermostat cards](../screenshots/thermostat-dark.png#only-dark)

A dial with the target and the actual temperature. The arc is orange while the room is heated, blue while the thermostat holds the temperature and grey when it is off.

## Using it

- Drag the dial or use − and +; quick steps are sent once, half a second after the last one.
- In the dial: power off, automatic/manual (`hvac_mode` auto ↔ heat), comfort and eco, and boost, where the thermostat has these presets.
- The badge shows boost, an open window, holiday (preset `away`), off, or the mode.
- Range and step come from the entity (`min_temp`, `max_temp`, `target_temp_step`).

## Options

| Option | Default | |
| --- | --- | --- |
| `entity` | required | The entity the card shows. |
| `name` |  | Shown instead of the entity's name. |
| `window_entity` |  | A window contact: the badge and an icon show "window open". |
| `valve_entity` |  | The valve opening in percent, shown under the name. |
| `humidity_entity` |  | A humidity sensor, for thermostats without `current_humidity`. |
| `effects` | `subtle` | Glow and motion: `off`, `subtle` or `strong`. See [Look and feel](../appearance.md#effects). |

All options can be set in the visual editor too.

```yaml
type: custom:kachelwerk-thermostat
entity: climate.bathroom
window_entity: binary_sensor.bathroom_window
valve_entity: sensor.bathroom_valve
```

## What it calls

`climate.set_temperature`, `climate.set_hvac_mode`, `climate.set_preset_mode`.
