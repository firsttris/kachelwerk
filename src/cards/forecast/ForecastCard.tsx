import { useState } from 'preact/hooks';
import { useMoreInfo } from '../../ha/context';
import type { CardProps } from '../../ha/defineCard';
import { isUnavailable, nameOf } from '../../ha/types';
import { Forecast } from './Forecast';
import {
  currentOf,
  type ForecastConfig,
  type ForecastType,
  forecastTypes,
  isNight,
  legacyForecast,
  sceneOf,
  stripOf,
  sunOf,
  todayOf,
  typeOf,
} from './forecastModel';
import { useForecast } from './useForecast';

export type { ForecastConfig };

export const ForecastCard = ({ hass, config }: CardProps<ForecastConfig>) => {
  const entity = hass.states[config.entity];
  const moreInfo = useMoreInfo();
  const types = forecastTypes(entity);
  const [picked, setPicked] = useState<ForecastType | null>(null);
  const type = picked && types.includes(picked) ? picked : typeOf(config, entity);
  // The daily forecast for today's high and low; the chosen one for the strip
  const daily = useForecast(hass.connection, config.entity, types.includes('daily') ? 'daily' : null);
  const chosen = useForecast(hass.connection, config.entity, type !== 'daily' ? type : null);
  const shown = type === 'daily' ? daily : (chosen ?? daily);
  const legacy = legacyForecast(entity);
  const now = new Date();
  const sun = sunOf(hass);
  const current = currentOf(entity);
  return (
    <Forecast
      name={nameOf(config, entity)}
      current={current}
      scene={sceneOf(current.condition, isNight(sun))}
      today={todayOf(daily?.entries ?? legacy, now)}
      items={shown ? stripOf(shown.entries, shown.type, now, sun) : legacy ? stripOf(legacy, 'daily', now, sun) : []}
      type={shown?.type ?? (legacy ? 'daily' : type)}
      types={types}
      status={{ UNREACH: isUnavailable(entity) }}
      onType={setPicked}
      onName={() => moreInfo(config.entity)}
    />
  );
};

// sun.sun: the moon instead of the sun at night
export const forecastEntities = (config: ForecastConfig) => [config.entity, 'sun.sun'];

export const forecastSchema = [
  { name: 'entity', required: true, selector: { entity: { domain: 'weather' } } },
  { name: 'name', selector: { text: {} } },
  {
    name: 'forecast_type',
    selector: { select: { mode: 'dropdown', options: ['daily', 'hourly', 'twice_daily'] } },
  },
  { name: 'effects', selector: { select: { mode: 'dropdown', options: ['off', 'subtle', 'strong'] } } },
];
