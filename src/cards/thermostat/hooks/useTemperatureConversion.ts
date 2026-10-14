import { useCallback } from 'preact/hooks';
import { DEFAULT_RANGE, MAX_ANGLE, stepOf, type TemperatureRange } from '../constants';

export const useTemperatureConversion = (range: TemperatureRange = DEFAULT_RANGE) => {
  const { min, max } = range;
  const step = stepOf(range);
  // Convert temperature to angle (0-270 degrees)
  const tempToAngle = useCallback(
    (temp: number) => {
      const clampedTemp = Math.max(min, Math.min(max, temp));
      const percentage = (clampedTemp - min) / (max - min);
      return percentage * MAX_ANGLE;
    },
    [min, max],
  );

  // Convert angle to temperature
  const angleToTemp = useCallback(
    (angle: number) => {
      const percentage = Math.max(0, Math.min(1, angle / MAX_ANGLE));
      const temp = min + percentage * (max - min);
      // Round to nearest step
      return Math.round(temp / step) * step;
    },
    [min, max, step],
  );

  return { tempToAngle, angleToTemp };
};
