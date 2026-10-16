<div align="center">

<img src="docs/assets/logo.svg" alt="Kachelwerk logo" width="72">

<h1>Kachelwerk: Home Assistant cards that feel like an app</h1>

**Shutters you drag like a window, lamps that cast their light into the tile, a thermostat dial, a Ferraris
meter whose disc turns with your power.**<br>
Thirteen Lovelace cards for the everyday controls of a home, from the tiles of
[ccu-addon-mui](https://github.com/firsttris/ccu-addon-mui). Light and dark with your theme, German and English, one file.

[![CI](https://github.com/firsttris/kachelwerk/actions/workflows/ci.yml/badge.svg)](https://github.com/firsttris/kachelwerk/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/firsttris/kachelwerk?logo=github&label=release)](https://github.com/firsttris/kachelwerk/releases/latest)
[![HACS: custom](https://img.shields.io/badge/HACS-custom-41bdf5?logo=homeassistantcommunitystore&logoColor=white)](https://firsttris.github.io/kachelwerk/installation.html)
[![Docs](https://img.shields.io/badge/docs-firsttris.github.io%2Fkachelwerk-4f46e5?logo=materialformkdocs&logoColor=white)](https://firsttris.github.io/kachelwerk/)
[![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue)](LICENSE)
<br>
[![Home Assistant 2025.1+](https://img.shields.io/badge/Home%20Assistant-2025.1%2B-18bcf2?logo=homeassistant&logoColor=white)](https://www.home-assistant.io/)
[![Sections view](https://img.shields.io/badge/dashboard-sections%20%7C%20masonry-18bcf2)](https://firsttris.github.io/kachelwerk/appearance.html#width)
[![Preact](https://img.shields.io/badge/Preact-10-673ab8?logo=preact&logoColor=white)](https://preactjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Deutsch | English](https://img.shields.io/badge/UI-Deutsch%20%7C%20English-1d4ed8)](https://firsttris.github.io/kachelwerk/)

```yaml
type: custom:kachelwerk-light
entity: light.dining_table
```

[Install](#-install) •
[Cards](#-cards) •
[FAQ](#-faq) •
[Documentation](https://firsttris.github.io/kachelwerk/) •
[Deutsch](README.de.md)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/hero-dark.png">
  <img src="docs/screenshots/hero.png" alt="Kachelwerk cards in two sections: lights, a thermostat dial, a media player, a shutter, a fan, a color light, the weather forecast, an alarm panel, who is home and a robot vacuum" width="800">
</picture>

</div>

## 💡 Why Kachelwerk?

Home Assistant's tile cards are tidy, but a shutter is a percentage, a lamp an icon and a thermostat a
number. Kachelwerk draws what you control:

- **Pictures instead of icons:** the shutter is a window you drag, the lamp hangs into the tile and lights
  it in its own color, the floor heating loop fills with warm water as far as its valve is open.
- **It shows what happens:** a shutter travels to its target instead of jumping back to the old position
  the actuator reports while it moves; a light switched at the wall swings and says so.
- **Safe where it matters:** opening the garage has to be held, the front door slid open, so a stray tap
  on the wall tablet never opens anything.
- **Made for your dashboard:** your theme's colors, light and dark, the widths of a sections view, a
  visual editor for every option, more-info on a tap.
- **One file, no cloud:** `kachelwerk.js` with its font, installed by HACS.

Works with any integration: Homematic, Zigbee, Matter, Shelly, KNX, whatever gives Home Assistant a cover,
a light or a climate entity.

## 🚀 Install

**HACS:** ⋮ → **Custom repositories** → `https://github.com/firsttris/kachelwerk`, type **Dashboard** →
download **Kachelwerk** → reload the page.

**Manually:** `kachelwerk.js` from the [latest release](https://github.com/firsttris/kachelwerk/releases/latest)
to `config/www/kachelwerk/`, then add `/local/kachelwerk/kachelwerk.js` as a JavaScript module under
**Settings → Dashboards → Resources**.

Then **Add card** → search for **Kachelwerk**. More in the [installation guide](https://firsttris.github.io/kachelwerk/installation.html).

## 🧩 Cards

| | |
| --- | --- |
| **[Shutter](https://firsttris.github.io/kachelwerk/cards/shutter.html)** `cover`<br>A window to drag; travels to its target, slats for venetian blinds.<br><img src="docs/animations/shutter.webp" width="400" alt="Shutter cards"> | **[Light](https://firsttris.github.io/kachelwerk/cards/light.html)** `light` `switch`<br>A pendant lamp with its cone of light; dimmer, color light or socket.<br><img src="docs/animations/light.webp" width="400" alt="Light cards"> |
| **[Thermostat](https://firsttris.github.io/kachelwerk/cards/thermostat.html)** `climate`<br>A dial; boost, automatic/manual, comfort and eco, window open.<br><img src="docs/animations/thermostat.webp" width="400" alt="Thermostat cards"> | **[Floor heating](https://firsttris.github.io/kachelwerk/cards/floor.html)** `number` `switch`<br>The heating loop fills with warm water; the pump.<br><img src="docs/animations/floor.webp" width="400" alt="Floor heating cards"> |
| **[Window](https://firsttris.github.io/kachelwerk/cards/window.html)** `binary_sensor` `sensor`<br>Tilted or open as a picture; window handles turn their knob.<br><img src="docs/animations/window.webp" width="400" alt="Window cards"> | **[Detector](https://firsttris.github.io/kachelwerk/cards/detector.html)** `binary_sensor` `siren`<br>Smoke, motion, presence, water, rain, mains failure, sirens.<br><img src="docs/animations/detector.webp" width="400" alt="Detector cards"> |
| **[Lock](https://firsttris.github.io/kachelwerk/cards/lock.html)** `lock`<br>Lock with a tap, unlock by holding, open by sliding.<br><img src="docs/animations/lock.webp" width="400" alt="Lock cards"> | **[Garage door](https://firsttris.github.io/kachelwerk/cards/garage.html)** `cover`<br>A sectional door; opening has to be held.<br><img src="docs/animations/garage.webp" width="400" alt="Garage door card"> |
| **[Meter](https://firsttris.github.io/kachelwerk/cards/meter.html)** `sensor`<br>A Ferraris meter whose disc turns with the power, a gas meter.<br><img src="docs/animations/meter.webp" width="400" alt="Meter cards"> | **[Climate sensor](https://firsttris.github.io/kachelwerk/cards/climate-sensor.html)** `sensor` `weather`<br>Temperature, a humidity ring, dew point, wind and rain.<br><img src="docs/animations/climate-sensor.webp" width="400" alt="Climate sensor cards"> |
| **[Sensor](https://firsttris.github.io/kachelwerk/cards/sensor.html)** `sensor`<br>One value large; CO₂, particulate matter and soil moisture rated.<br><img src="docs/animations/sensor.webp" width="400" alt="Sensor cards"> | **[Valve](https://firsttris.github.io/kachelwerk/cards/valve.html)** `valve` `switch` `cover`<br>Valves, irrigation, window drives.<br><img src="docs/animations/valve.webp" width="400" alt="Valve cards"> |
| **[Buttons](https://firsttris.github.io/kachelwerk/cards/buttons.html)** `button` `script` `event`<br>A keypad: short and long press, presses at the device light up.<br><img src="docs/animations/buttons.webp" width="400" alt="Button cards"> | **[Air conditioner](https://firsttris.github.io/kachelwerk/cards/aircon.html)** `climate`<br>Air streams out in the mode's color; target or range, modes, fan and swing.<br><img src="docs/animations/aircon.webp" width="400" alt="Air conditioner card"> |
| **[Robot vacuum and lawn mower](https://firsttris.github.io/kachelwerk/cards/robot.html)** `vacuum` `lawn_mower`<br>The robot drives its lanes and back to its station; start, pause, dock, suction.<br><img src="docs/animations/robot.webp" width="400" alt="Robot vacuum and lawn mower cards"> | **[Media player](https://firsttris.github.io/kachelwerk/cards/media.html)** `media_player`<br>The cover blurred behind it, play and pause, tracks, volume, source and sound mode.<br><img src="docs/animations/media.webp" width="400" alt="Media player cards"> |
| **[Water heater](https://firsttris.github.io/kachelwerk/cards/water-heater.html)** `water_heater`<br>A tank whose water rises and warms with its temperature; target, modes, away.<br><img src="docs/animations/water-heater.webp" width="400" alt="Water heater card"> | **[Alarm panel](https://firsttris.github.io/kachelwerk/cards/alarm.html)** `alarm_control_panel`<br>A shield in the state's color; arm modes, a keypad for the code.<br><img src="docs/animations/alarm.webp" width="400" alt="Alarm panel cards"> |
| **[Fan](https://firsttris.github.io/kachelwerk/cards/fan.html)** `fan`<br>Blades that turn with the speed and sweep while oscillating; presets, direction.<br><img src="docs/animations/fan.webp" width="400" alt="Fan cards"> | **[Humidifier](https://firsttris.github.io/kachelwerk/cards/humidifier.html)** `humidifier`<br>Mist rising, or a dehumidifier collecting drops; target humidity and mode.<br><img src="docs/animations/humidifier.webp" width="400" alt="Humidifier cards"> |
| **[Presence](https://firsttris.github.io/kachelwerk/cards/presence.html)** `person` `device_tracker`<br>Who is home: pictures, the zone and since when.<br><img src="docs/animations/presence.webp" width="400" alt="Presence card"> | **[Forecast](https://firsttris.github.io/kachelwerk/cards/forecast.html)** `weather`<br>The weather as a moving picture; the coming days or hours.<br><img src="docs/animations/forecast.webp" width="400" alt="Forecast card"> |

Every card in light and dark, with its options, is in the [documentation](https://firsttris.github.io/kachelwerk/).

## ❓ FAQ

### Do I need a Homematic CCU?

No. The cards come from ccu-addon-mui, a web UI for the Homematic CCU, but in Home Assistant they work with entities
and services only, from any integration.

### Why is my switch shown as a socket?

A `switch` becomes a lamp when its name (or its entity id) sounds like a light: "Licht", "Lampe", "light",
"lamp", "LED" and the like. Anything else is a socket with a plug. `tile: light` decides it yourself.

### Can I change how wide a card is?

Yes, in a sections view under **Layout** in the card editor. Every card brings a width that suits it and
rearranges itself on narrow cards. See [Look and feel](https://firsttris.github.io/kachelwerk/appearance.html#width).

### The shutter's travel in the card is faster or slower than the real one

Set `travel_time` to the seconds your shutter takes from fully closed to fully open.

### Can I turn the glow and the animations off?

`effects: off` per card, or `strong` for more. With "reduce motion" in your operating system nothing moves.

## 📚 Documentation

[firsttris.github.io/kachelwerk](https://firsttris.github.io/kachelwerk/): every card with its options and
an example, [installation](https://firsttris.github.io/kachelwerk/installation.html),
[look and feel](https://firsttris.github.io/kachelwerk/appearance.html),
[development](https://firsttris.github.io/kachelwerk/development.html).

## 🛠️ Development

```sh
npm install
npm run dev            # the demo page with example entities
npm test               # unit tests
npm run test:e2e       # the cards clicked through in a browser
npm run build          # dist/kachelwerk.js
npm run screenshots    # docs/screenshots
```

How the cards are built: [CLAUDE.md](CLAUDE.md) and the [development page](https://firsttris.github.io/kachelwerk/development.html).

## 🤝 Contributing

Issues and pull requests are welcome. A change to a card that comes from ccu-addon-mui is best made in
[ccu-addon-mui](https://github.com/firsttris/ccu-addon-mui) too, so both stay alike.

## 📄 License

[AGPL-3.0](LICENSE), like ccu-addon-mui.
