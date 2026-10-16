import ArrowUpIcon from '~icons/lucide/arrow-up';
import ArrowDownIcon from '~icons/lucide/arrow-down';
import UmbrellaIcon from '~icons/lucide/umbrella';
import { Tile, type TileStatus } from '../../components/Tile';
import { useEffects } from '../../contexts/EffectsContext';
import { m } from '../../i18n/messages';
import { formatNumber } from '../../lib/format';
import { cn } from '../../lib/utils';
import type { CurrentWeather, ForecastType, Scene, StripItem } from './forecastModel';
import { ForecastStrip } from './ForecastStrip';
import { conditionText, degrees, TYPE_LABEL } from './labels';
import { WeatherArt } from './WeatherArt';

export interface ForecastProps {
  name: string;
  current: CurrentWeather;
  scene: Scene;
  today: { high: number | null; low: number | null; probability: number | null } | null;
  items: StripItem[];
  // The type the strip shows, and the types to switch between
  type: ForecastType | null;
  types: ForecastType[];
  status?: TileStatus;
  onType?: (type: ForecastType) => void;
  onName?: () => void;
}

// The sky behind the tile, faint, in the weather's color
const skyOf = (scene: Scene) =>
  scene.bolt || scene.heavy
    ? '100, 116, 139'
    : scene.rain || scene.hail
      ? '56, 189, 248'
      : scene.snow
        ? '186, 230, 253'
        : scene.moon
          ? '129, 140, 248'
          : scene.sun
            ? '251, 191, 36'
            : '148, 163, 184';

const TypeSwitch = ({ type, types, onType }: { type: ForecastType; types: ForecastType[]; onType?: (t: ForecastType) => void }) => (
  <div role="group" aria-label={m.FORECAST()} className="flex shrink-0 rounded-full bg-muted/70 p-0.5">
    {types.map((t) => (
      <button
        key={t}
        type="button"
        aria-pressed={t === type}
        onClick={() => onType?.(t)}
        className={cn(
          // 28 px to see, 44 px to hit
          'press relative h-7 rounded-full px-2.5 text-xs font-medium whitespace-nowrap after:absolute after:inset-x-0 after:-inset-y-2',
          t === type ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        {TYPE_LABEL[t]()}
      </button>
    ))}
  </div>
);

// The weather now with its picture, today's high and low, and the forecast
// of the coming days or hours below
export const Forecast = ({ name, current, scene, today, items, type, types, status, onType, onName }: ForecastProps) => {
  const effects = useEffects();
  const sky = skyOf(scene);
  const unit = current.unit.replace('°', '');
  return (
    <Tile
      status={status}
      role="group"
      aria-label={name}
      style={
        effects.on
          ? {
              background: `radial-gradient(80% 90% at 0% 0%, rgba(${sky}, ${Math.min(0.5, 0.16 * effects.k)}), transparent 70%), var(--card)`,
            }
          : undefined
      }
    >
      <div className="flex flex-col gap-3 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
          <button type="button" onClick={onName} className="min-w-0 text-left text-[15px] leading-snug font-medium" title={name}>
            <span className="line-clamp-2">{name}</span>
          </button>
          {type && types.length > 1 && <TypeSwitch type={type} types={types} onType={onType} />}
        </div>
        <div className="flex items-center gap-3 @max-[220px]:gap-2">
          <WeatherArt
            scene={scene}
            moving={effects.on}
            className="size-[72px] @max-[220px]:size-12"
          />
          <div className="flex min-w-0 flex-col">
            <span
              role="img"
              aria-label={`${conditionText(current.condition)}, ${current.temperature !== null ? `${formatNumber(current.temperature, 1)} ${current.unit}` : '–'}`}
              className="text-[40px] leading-none font-semibold tracking-[-0.04em] whitespace-nowrap tabular-nums"
            >
              {current.temperature !== null ? formatNumber(current.temperature, 1) : '–'}
              <span className="ml-0.5 align-top text-lg font-medium text-muted-foreground">
                °<span className="@max-[220px]:hidden">{unit}</span>
              </span>
            </span>
            <span role="status" className="mt-1 truncate text-[13px] text-muted-foreground">
              {conditionText(current.condition)}
            </span>
            {today && (
              <span className="flex flex-wrap items-center gap-x-2 text-[13px] leading-snug tabular-nums [&_svg]:size-3.5">
                {today.high !== null && (
                  <span className="flex items-center" aria-label={`${m.FORECAST_HIGH()} ${degrees(today.high)}`}>
                    <ArrowUpIcon className="text-orange-500" aria-hidden />
                    {degrees(today.high)}
                  </span>
                )}
                {today.low !== null && (
                  <span className="flex items-center text-muted-foreground" aria-label={`${m.FORECAST_LOW()} ${degrees(today.low)}`}>
                    <ArrowDownIcon className="text-sky-500" aria-hidden />
                    {degrees(today.low)}
                  </span>
                )}
                {today.probability !== null && today.probability >= 10 && (
                  <span
                    className="flex items-center gap-0.5 text-sky-700 dark:text-sky-300"
                    aria-label={m.FORECAST_PRECIPITATION({ percent: Math.round(today.probability) })}
                  >
                    <UmbrellaIcon aria-hidden />
                    {Math.round(today.probability)} %
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
        {type && items.length > 0 && (
          // A new strip for another type: it starts at its beginning
          <ForecastStrip key={type} items={items} type={type} precipitationUnit={current.precipitationUnit} />
        )}
      </div>
    </Tile>
  );
};
