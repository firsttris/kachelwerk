# Kachelwerk

**Lovelace cards for Home Assistant that feel like an app.**
Shutters you drag like a window, lamps that cast their light into the tile, a thermostat dial, a Ferraris
meter whose disc turns with your power: thirteen cards for the everyday controls of a home.

![Kachelwerk cards: lights, thermostats, shutters and a color light](screenshots/hero.png#only-light)
![Kachelwerk cards: lights, thermostats, shutters and a color light](screenshots/hero-dark.png#only-dark)

The cards are the tiles of [ccu-addon-mui](https://github.com/firsttris/ccu-addon-mui), a modern web UI for the
Homematic CCU, brought to Home Assistant. They work with any integration: what a card shows comes from
Home Assistant's entities, what it does are Home Assistant's services.

## The cards

| Card | For | |
| --- | --- | --- |
| [Shutter](cards/shutter.md) | `cover` | A window to drag; travels to its target, slats for venetian blinds |
| [Light](cards/light.md) | `light`, `switch` | A pendant lamp with its cone of light; dimmer, color light or socket |
| [Thermostat](cards/thermostat.md) | `climate` | A dial; boost, automatic/manual, comfort and eco, window open |
| [Air conditioner](cards/aircon.md) | `climate` | Air streams out in the mode's color; target or range, modes, fan and swing |
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
| [Robot vacuum and lawn mower](cards/robot.md) | `vacuum`, `lawn_mower` | The robot drives its lanes and back to its station; start, pause, dock, suction, battery |
| [Media player](cards/media.md) | `media_player` | The cover blurred behind it; play and pause, tracks, volume, source and sound mode |
| [Water heater](cards/water-heater.md) | `water_heater` | A tank whose water rises and warms with its temperature; target, modes, away |
| [Alarm panel](cards/alarm.md) | `alarm_control_panel` | A shield in the state's color; arm modes, a keypad for the code, the alarm by hand |
| [Fan](cards/fan.md) | `fan` | Blades that turn with the speed; speeds, presets, oscillation, direction |
| [Humidifier](cards/humidifier.md) | `humidifier` | Mist rising or drops collecting; target humidity and mode |
| [Presence](cards/presence.md) | `person`, `device_tracker` | Who is home: pictures, the zone and since when |
| [Forecast](cards/forecast.md) | `weather` | The weather as a moving picture; the coming days or hours |

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
