import type { ComponentChildren as ReactNode } from 'preact';
import { Tile, type TileStatus } from '../../components/Tile';
import { m } from '../../i18n/messages';
import { cn } from '../../lib/utils';

// From MUI's SensorControls: the measurement tile and the ratings of CO₂,
// particulate matter and soil moisture

export type Rating = 'good' | 'fair' | 'poor' | 'bad';

const ratingText: Record<Rating, string> = {
  good: 'text-green-700 dark:text-green-300',
  fair: 'text-lime-700 dark:text-lime-300',
  poor: 'text-amber-700 dark:text-amber-300',
  bad: 'text-red-600 dark:text-red-400',
};

// A measurement: the value large with its unit, how good it is, and more
// values below
export const MeasureTile = ({
  name,
  status,
  onName,
  value,
  unit,
  label,
  rating,
  ratingLabel,
  caption,
  extras = [],
}: {
  name: string;
  status?: TileStatus;
  onName?: () => void;
  value: string;
  unit: string;
  label: string;
  // What is measured, when the unit alone doesn't tell (PM2.5)
  caption?: string;
  rating?: Rating;
  ratingLabel?: string;
  extras?: ReactNode[];
}) => (
  <Tile status={status} role="group" aria-label={name}>
    <div className="flex flex-col gap-3 p-4">
      <button type="button" onClick={onName} className="line-clamp-2 text-left text-[15px] leading-snug font-medium" title={name}>
        {name}
      </button>
      {caption && <span className="-mb-2 text-xs font-medium text-muted-foreground">{caption}</span>}
      <div className="flex items-end justify-between gap-3">
        <span
          // A name only goes on an element with a role: read as one value with its unit
          role="img"
          className="text-[40px] leading-none font-semibold tracking-[-0.04em] tabular-nums"
          aria-label={`${label} ${value} ${unit}`}
        >
          {value}
          <span className="ml-1 text-lg font-medium text-muted-foreground">{unit}</span>
        </span>
        {rating && ratingLabel && (
          <span role="status" className={cn('pb-1 text-[13px] font-medium', ratingText[rating])}>
            {ratingLabel}
          </span>
        )}
      </div>
      {extras.length > 0 && <div className="grid grid-cols-2 gap-2 @max-[300px]:grid-cols-1">{extras}</div>}
    </div>
  </Tile>
);

// --- CO₂ (HmIP-SCTH230). Rated as the German Environment Agency (UBA)
// rates indoor air: below 1000 ppm harmless, up to 2000 ppm conspicuous,
// above unacceptable.

export const co2Rating = (ppm: number): Rating => (ppm < 1000 ? 'good' : ppm <= 2000 ? 'poor' : 'bad');

export const co2Label: Record<Rating, () => string> = {
  good: m.CO2_GOOD,
  fair: m.CO2_GOOD,
  poor: m.CO2_RAISED,
  bad: m.CO2_BAD,
};

// --- Particulate matter (HmIP-SFD), rated by PM2.5 with the European Air
// Quality Index of the EEA (µg/m³: 10 good, 20 fair, 25 moderate, 50 poor,
// 75 very poor, above extremely poor)

type PmRating = 'PM_GOOD' | 'PM_FAIR' | 'PM_MODERATE' | 'PM_POOR' | 'PM_VERY_POOR' | 'PM_EXTREMELY_POOR';

export const pmRating = (pm25: number): PmRating =>
  pm25 <= 10
    ? 'PM_GOOD'
    : pm25 <= 20
      ? 'PM_FAIR'
      : pm25 <= 25
        ? 'PM_MODERATE'
        : pm25 <= 50
          ? 'PM_POOR'
          : pm25 <= 75
            ? 'PM_VERY_POOR'
            : 'PM_EXTREMELY_POOR';

// Static references: a lookup m[key] would put every text into the bundle
export const pmLabel: Record<PmRating, () => string> = {
  PM_GOOD: m.PM_GOOD,
  PM_FAIR: m.PM_FAIR,
  PM_MODERATE: m.PM_MODERATE,
  PM_POOR: m.PM_POOR,
  PM_VERY_POOR: m.PM_VERY_POOR,
  PM_EXTREMELY_POOR: m.PM_EXTREMELY_POOR,
};
export const soilLabel = { SOIL_DRY: m.SOIL_DRY, SOIL_MOIST: m.SOIL_MOIST, SOIL_WET: m.SOIL_WET };

export const pmTone: Record<PmRating, Rating> = {
  PM_GOOD: 'good',
  PM_FAIR: 'fair',
  PM_MODERATE: 'poor',
  PM_POOR: 'poor',
  PM_VERY_POOR: 'bad',
  PM_EXTREMELY_POOR: 'bad',
};

// --- Soil moisture (ELV-SH-SMSI)

export const soilRating = (percent: number): 'SOIL_DRY' | 'SOIL_MOIST' | 'SOIL_WET' =>
  percent < 30 ? 'SOIL_DRY' : percent > 70 ? 'SOIL_WET' : 'SOIL_MOIST';

