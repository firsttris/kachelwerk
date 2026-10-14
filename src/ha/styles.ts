import css from '../styles.css?inline';
// MUI's font: Geist, the latin glyphs (with umlauts), inside the bundle so
// HACS installs one file and nothing is fetched from a CDN
import geist from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?inline';

// Tailwind 4 registers its variables (--tw-shadow, --tw-gradient-from, …)
// with @property. Inside a shadow root browsers ignore @property, the
// variables then have no initial value and shadows, gradients and
// transforms stay empty. So the @property rules go to the document once
// (they are global anyway), the rest into each card's shadow root.
const PROPERTY = /@property\s+--[\w-]+\s*\{[^}]*\}/g;

// Fonts, like @property, only work when declared in the document
const fontFace = `@font-face {
  font-family: 'Kachelwerk Geist';
  font-style: normal;
  font-display: swap;
  font-weight: 100 900;
  src: url(${geist}) format('woff2-variations');
  unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}`;

const properties = [fontFace, ...(css.match(PROPERTY) ?? [])].join('\n');
const scoped = css.replace(PROPERTY, '').replaceAll(':root', ':host');

let sheet: CSSStyleSheet | undefined;

const registerProperties = () => {
  if (document.getElementById('kachelwerk-properties')) return;
  const style = document.createElement('style');
  style.id = 'kachelwerk-properties';
  style.textContent = properties;
  document.head.append(style);
};

export const adoptStyles = (root: ShadowRoot) => {
  registerProperties();
  if (!sheet) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(scoped);
  }
  root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
};
