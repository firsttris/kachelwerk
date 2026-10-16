import { useEffect, useRef, useState } from 'preact/hooks';
import { m } from '../../i18n/messages';
import { formatNumber } from '../../lib/format';
import { cn } from '../../lib/utils';
import { type ForecastType, sceneOf, type StripItem } from './forecastModel';
import { conditionText, degrees, itemLabel, itemWhen } from './labels';
import { WeatherArt } from './WeatherArt';

// Which ends of the strip have more to scroll to: they fade out
const useOverflow = (items: number) => {
  const ref = useRef<HTMLUListElement>(null);
  const [ends, setEnds] = useState({ start: false, end: false });
  const measure = () => {
    const el = ref.current;
    if (!el) return;
    const start = el.scrollLeft > 2;
    const end = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
    setEnds((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  };
  // biome-ignore lint/correctness/useExhaustiveDependencies: measured again when the entries change
  useEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [items]);
  return { ref, ends, measure };
};

const FADE = '20px';

// Precipitation: the chance where the integration gives one, else the amount
const rainOf = (item: StripItem, unit: string) =>
  item.probability !== null
    ? item.probability >= 10
      ? `${Math.round(item.probability)} %`
      : null
    : item.precipitation
      ? `${formatNumber(item.precipitation, 1)} ${unit}`
      : null;

// The forecast as a row of days or hours; more than fit scroll sideways
export const ForecastStrip = ({
  items,
  type,
  precipitationUnit,
}: {
  items: StripItem[];
  type: ForecastType;
  precipitationUnit: string;
}) => {
  const { ref, ends, measure } = useOverflow(items.length);
  const mask = `linear-gradient(to right, ${ends.start ? 'transparent' : '#000'}, #000 ${FADE}, #000 calc(100% - ${FADE}), ${ends.end ? 'transparent' : '#000'})`;
  return (
    <ul
      ref={ref}
      onScroll={measure}
      aria-label={m.FORECAST()}
      className="-mx-1.5 flex snap-x snap-mandatory scroll-px-1.5 gap-1 overflow-x-auto px-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ maskImage: mask, WebkitMaskImage: mask }}
    >
      {items.map((item) => {
        const rain = rainOf(item, precipitationUnit);
        const label = [
          itemWhen(item, type),
          conditionText(item.condition),
          item.high !== null && degrees(item.high),
          item.low !== null && degrees(item.low),
          rain,
        ]
          .filter(Boolean)
          .join(', ');
        return (
          <li
            key={`${item.at.getTime()}${item.night ? 'n' : ''}`}
            aria-label={label}
            className={cn(
              'flex min-w-[46px] flex-1 shrink-0 snap-start flex-col items-center rounded-xl px-1 pt-1.5 pb-1 text-center',
              item.first ? 'bg-muted/70' : 'bg-muted/30',
            )}
          >
            <span className={cn('text-xs leading-tight whitespace-nowrap', item.first ? 'font-medium' : 'text-muted-foreground')}>
              {itemLabel(item, type)}
            </span>
            <WeatherArt scene={sceneOf(item.condition, item.night)} className="my-0.5 size-8" />
            {/* Every row keeps its place, also where a value is missing (the
                hours have no low): switching days and hours keeps the height */}
            <span className="text-[13px] leading-tight font-medium tabular-nums">
              {item.high !== null ? degrees(item.high) : '\u00a0'}
            </span>
            <span className="text-xs leading-tight text-muted-foreground tabular-nums">
              {item.low !== null ? degrees(item.low) : '\u00a0'}
            </span>
            <span className="mt-0.5 text-[11px] leading-tight font-medium whitespace-nowrap text-sky-700 tabular-nums dark:text-sky-300">
              {rain || '\u00a0'}
            </span>
          </li>
        );
      })}
    </ul>
  );
};
