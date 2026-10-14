# Kachelwerk

**Lovelace cards for Home Assistant that feel like an app.**
Shutters you drag like a window, lamps that cast their light into the tile, a thermostat dial, a Ferraris
meter whose disc turns with your power: thirteen cards for the everyday controls of a home.

![Kachelwerk cards: lights, thermostats, shutters and a color light](screenshots/hero.png#only-light)
![Kachelwerk cards: lights, thermostats, shutters and a color light](screenshots/hero-dark.png#only-dark)

The cards are the tiles of [MUI](https://github.com/firsttris/ccu-addon-mui), a modern web UI for the
Homematic CCU, brought to Home Assistant. They work with any integration: what a card shows comes from
Home Assistant's entities, what it does are Home Assistant's services.

## The cards

| Card | For | |
| --- | --- | --- |
| [Shutter](cards/shutter.md) | `cover` | A window to drag; travels to its target, slats for venetian blinds |
| [Light](cards/light.md) | `light`, `switch` | A pendant lamp with its cone of light; dimmer, color light or socket |
| [Thermostat](cards/thermostat.md) | `climate` | A dial; boost, automatic/manual, comfort and eco, window open |
| [Floor heating](cards/floor.md) | `number`, `switch` | A heating loop that fills with warm water; the pump |
| [Window](cards/window.md) | `binary_sensor`, `sensor` | A window that tilts or swings open; window handles |
| [Garage door](cards/garage.md) | `cover` | A sectional door; opening has to be held |
| [Lock](cards/lock.md) | `lock` | A door with its bolt; unlock by holding, open by sliding |
| [Climate sensor](cards/climate-sensor.md) | `sensor`, `weather` | Temperature, a humidity ring, dew point, weather |
| [Meter](cards/meter.md) | `sensor` | A Ferraris meter for electricity, a gas meter |
| [Sensor](cards/sensor.md) | `sensor` | One value large; CO₂, particulate matter and soil moisture rated |
| [Detector](cards/detector.md) | `binary_sensor`, `siren` | Smoke, motion, presence, water, rain, mains failure, sirens |
| [Valve](cards/valve.md) | `valve`, `switch`, `cover` | Valves, irrigation, window drives |
| [Buttons](cards/buttons.md) | `button`, `script`, `event` | A keypad: short and long press, presses at the device light up |

## What they have in common

- **Your theme:** light and dark follow Home Assistant, the colors, corners and shadows come from your
  theme. See [Look and feel](appearance.md).
- **Your language:** German or English, as set in your Home Assistant profile.
- **Sections views:** every card knows how wide it wants to be (a light a third of a section, a
  thermostat half, a color light the whole width) and rearranges itself on narrow cards.
- **Visual editor:** every option can be set without YAML.
- **Safe controls:** what must not happen by accident takes a deliberate gesture: hold to open the
  garage, slide to open the front door, hold for the smoke test.
- **More-info:** tap a name, or hold a light, for Home Assistant's dialog of the entity.
- **One file:** `kachelwerk.js`, with its font; nothing is loaded from elsewhere.

Next: [Installation](installation.md).
