import type { RGB } from '../../components/light/PendantLamp';

// From MUI's ColorLightControl.

// Hue 0..360, saturation 0..1 at full value
export const hsvToRgb = (hue: number, saturation: number): RGB => {
  const h = (((hue % 360) + 360) % 360) / 60;
  const c = saturation;
  const x = c * (1 - Math.abs((h % 2) - 1));
  const [r, g, b] =
    h < 1 ? [c, x, 0] : h < 2 ? [x, c, 0] : h < 3 ? [0, c, x] : h < 4 ? [0, x, c] : h < 5 ? [x, 0, c] : [c, 0, x];
  const m0 = 1 - c;
  return [r, g, b].map((v) => Math.round((v + m0) * 255)) as RGB;
};

// Color of white light by its temperature in kelvin (approximation by
// Tanner Helland, good for 1000-12000 K)
export const kelvinToRgb = (kelvin: number): RGB => {
  const t = kelvin / 100;
  const clamp = (v: number) => Math.round(Math.max(0, Math.min(255, v)));
  const r = t <= 66 ? 255 : 329.698727446 * (t - 60) ** -0.1332047592;
  const g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * (t - 60) ** -0.0755148492;
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  return [clamp(r), clamp(g), clamp(b)];
};
