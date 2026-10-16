import { useEffect, useState } from 'preact/hooks';
import type { HassConnection } from '../../ha/types';
import { type ForecastEntry, type ForecastEvent, type ForecastType, subscribeMessage } from './forecastModel';

// The forecast of a weather entity, as HA's own weather card gets it: a
// subscription to weather/subscribe_forecast (weather/websocket_api.py) that
// sends the forecast at once and again whenever the integration has a new one.
// null until the first message (or when there is no connection or type).
// Switching the type keeps the last forecast, with its type, until the new
// one comes, so the strip doesn't jump.
export interface Received {
  type: ForecastType;
  entries: ForecastEntry[] | null;
}

export const useForecast = (
  connection: HassConnection | undefined,
  entityId: string,
  type: ForecastType | null,
): Received | null => {
  const [forecast, setForecast] = useState<(Received & { entityId: string }) | null>(null);
  useEffect(() => {
    if (!connection || !type) return;
    let unsubscribe: (() => unknown) | undefined;
    let ended = false;
    connection
      .subscribeMessage<ForecastEvent>(
        (event) => setForecast({ entityId, type, entries: event.forecast ?? null }),
        subscribeMessage(entityId, type),
      )
      .then((stop) => {
        if (ended) stop();
        else unsubscribe = stop;
      })
      .catch((error: unknown) => console.error('kachelwerk:', error));
    return () => {
      ended = true;
      unsubscribe?.();
    };
  }, [connection, entityId, type]);
  // Another entity's forecast never shows
  return forecast?.entityId === entityId && type ? forecast : null;
};
