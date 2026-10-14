# Climate sensor

`custom:kachelwerk-climate-sensor` · for `sensor`, `weather`

![Climate sensor cards](../screenshots/climate-sensor.png#only-light)
![Climate sensor cards](../screenshots/climate-sensor-dark.png#only-dark)

The temperature large with a glow in its color, the humidity as a ring with "dry", "comfortable" or "humid" and the dew point, and what a weather station adds.

## Using it

- A temperature sensor with the other sensors named in the YAML.
- A `weather` entity brings temperature, humidity and wind itself.
- Wind is converted to km/h, sunshine to minutes.

## Options

| Option | Default | |
| --- | --- | --- |
| `entity` | required | The entity the card shows. |
| `name` |  | Shown instead of the entity's name. |
| `humidity_entity` |  | Humidity in %. |
| `wind_entity` |  | Wind speed (m/s, km/h, mph, kn). |
| `rain_entity` |  | A `binary_sensor` (raining) or an amount in mm. |
| `illuminance_entity` |  | Brightness in lx. |
| `sunshine_entity` |  | Sunshine duration (s, min or h). |
| `effects` | `subtle` | Glow and motion: `off`, `subtle` or `strong`. See [Look and feel](../appearance.md#effects). |

All options can be set in the visual editor too.

```yaml
type: custom:kachelwerk-climate-sensor
entity: sensor.living_room_temperature
humidity_entity: sensor.living_room_humidity
```

## What it calls

None, the card only shows.
