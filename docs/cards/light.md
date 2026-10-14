# Light

`custom:kachelwerk-light` · for `light`, `switch`, `input_boolean`

![Light cards](../screenshots/light.png#only-light)
![Light cards](../screenshots/light-dark.png#only-dark)

A pendant lamp hangs into the tile and, switched on, casts a cone of light in the light's color, as bright as it is dimmed. Which tile an entity gets follows what it can do.

## Using it

- **Light** (on/off): the lamp, a third of a section wide.
- **Dimmer** (lights with brightness): the lamp and a brightness bar, half a section.
- **Color light** (hue or color temperature): brightness, a hue bar and quick colors and whites, a whole section wide.
- **Socket**: switches whose name doesn't sound like a light get a wall socket with a plug, current running through its cable while on.
- Tap the tile to toggle; hold it for the entity's more-info dialog. A switch at the wall swings the lamp and shows "at the device".

## Options

| Option | Default | |
| --- | --- | --- |
| `entity` | required | The entity the card shows. |
| `name` |  | Shown instead of the entity's name. |
| `tile` | by the entity | `light`, `socket`, `dimmer` or `color`, to choose the tile yourself. |
| `effects` | `subtle` | Glow and motion: `off`, `subtle` or `strong`. See [Look and feel](../appearance.md#effects). |

All options can be set in the visual editor too.

```yaml
type: custom:kachelwerk-light
entity: switch.coffee_machine
tile: socket
```

## What it calls

`light.toggle` / `homeassistant.toggle`, `light.turn_on` with `brightness_pct`, `hs_color` or `color_temp_kelvin`, `light.turn_off`.
