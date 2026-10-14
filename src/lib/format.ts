import { getLocale } from '../i18n/messages';

// From MUI's lib/format. Making an Intl format is slow (it loads the
// locale's data), so one is kept per language and options
const formats = new Map<string, Intl.NumberFormat>();

export const numberFormat = (options: Intl.NumberFormatOptions) => {
  const locale = getLocale();
  const key = `${locale}|${JSON.stringify(options)}`;
  let format = formats.get(key);
  if (!format) {
    format = new Intl.NumberFormat(locale, options);
    formats.set(key, format);
  }
  return format;
};

// A number in the tile's language, with at most max and at least min decimals
export const formatNumber = (value: number, max: number, min = 0) =>
  numberFormat({ minimumFractionDigits: min, maximumFractionDigits: max }).format(value);

// A temperature with one decimal, as the thermostats show it
export const formatTemperature = (value: number) => formatNumber(value, 1, 1);
