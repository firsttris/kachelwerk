# Detector

`custom:kachelwerk-detector` · for `binary_sensor`, `siren`

![Detector cards](../screenshots/detector.png#only-light)
![Detector cards](../screenshots/detector-dark.png#only-dark)

Detectors by their device class, calm green, blue while something happens, red and pulsing on alarm.

## Using it

- **Smoke** (also gas, carbon monoxide, heat): a smoke detector seen from below whose LED flashes; on alarm smoke rises. A smoke test button has to be held, it sounds the siren.
- **Motion** and **presence**: radar waves while something moves, "last 7 min ago" from Home Assistant's last change, the brightness and a detection switch.
- **Water** (moisture), **rain** (`kind: rain`), **mains failure** (device class `power`) and **sirens**.

## Options

| Option | Default | |
| --- | --- | --- |
| `entity` | required | The entity the card shows. |
| `name` |  | Shown instead of the entity's name. |
| `kind` | by the device class | `smoke`, `motion`, `presence`, `water`, `siren`, `rain` or `power`. |
| `test_entity` |  | A `button` that starts the smoke test. |
| `illuminance_entity` |  | The brightness a motion detector measures. |
| `detection_entity` |  | A switch that turns detection on and off. |
| `effects` | `subtle` | Glow and motion: `off`, `subtle` or `strong`. See [Look and feel](../appearance.md#effects). |

All options can be set in the visual editor too.

```yaml
type: custom:kachelwerk-detector
entity: binary_sensor.hallway_smoke
test_entity: button.hallway_smoke_test
```

## What it calls

`button.press` for the smoke test, `homeassistant.turn_on` / `turn_off` for detection.
