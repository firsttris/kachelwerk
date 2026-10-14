# Meter

`custom:kachelwerk-meter` · for `sensor`

![Meter cards](../screenshots/meter.png#only-light)
![Meter cards](../screenshots/meter-dark.png#only-dark)

Electricity as a Ferraris meter whose disc turns with the power, faster the more flows and backwards while you feed in; gas as a diaphragm meter whose last roll turns while gas flows. The tenths are red, as on the real thing.

## Using it

- The main entity is recognized by its unit: W/kW (power), Wh/kWh/MWh (a reading), m³ (gas), m³/h (gas flow).
- Power is positive while you draw from the grid, negative while you feed in.
- Each reading in `energy` is a register on the meter, `feed_in` one more.

## Options

| Option | Default | |
| --- | --- | --- |
| `entity` | required | The entity the card shows. |
| `name` |  | Shown instead of the entity's name. |
| `power` |  | Power, if the main entity is a reading. |
| `energy` |  | One reading or a list of them (kWh). |
| `feed_in` |  | The feed-in reading. |
| `voltage` |  | Voltage in V. |
| `current` |  | Current (A or mA). |
| `frequency` |  | Grid frequency in Hz. |
| `gas` |  | Gas reading in m³. |
| `gas_flow` |  | Gas flow in m³/h. |
| `effects` | `subtle` | Glow and motion: `off`, `subtle` or `strong`. See [Look and feel](../appearance.md#effects). |

All options can be set in the visual editor too.

```yaml
type: custom:kachelwerk-meter
entity: sensor.grid_power
energy: sensor.grid_import
feed_in: sensor.grid_export
```

## What it calls

None, the card only shows.
