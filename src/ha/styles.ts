import css from '../styles.css?inline';

// Tailwind 4 registers its variables (--tw-shadow, --tw-gradient-from, …)
// with @property. Inside a shadow root browsers ignore @property, the
// variables then have no initial value and shadows, gradients and
// transforms stay empty. So the @property rules go to the document once
// (they are global anyway), the rest into each card's shadow root.
const PROPERTY = /@property\s+--[\w-]+\s*\{[^}]*\}/g;

const properties = (css.match(PROPERTY) ?? []).join('\n');
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
