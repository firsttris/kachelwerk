import type { ComponentType } from 'preact';
import SnowflakeIcon from '~icons/lucide/snowflake';
import FlameIcon from '~icons/lucide/flame';
import SunSnowIcon from '~icons/lucide/sun-snow';
import SparklesIcon from '~icons/lucide/sparkles';
import DropletsIcon from '~icons/lucide/droplets';
import FanIcon from '~icons/lucide/fan';
import ThermometerIcon from '~icons/lucide/thermometer';
import { m } from '../../i18n/messages';
import { cn } from '../../lib/utils';
import { toneOf } from './airconModel';
import { modeText } from './labels';
import { TONE_ACTIVE } from './tones';

const ICONS: Record<string, ComponentType> = {
  cool: SnowflakeIcon,
  heat: FlameIcon,
  heat_cool: SunSnowIcon,
  auto: SparklesIcon,
  dry: DropletsIcon,
  fan_only: FanIcon,
};

// One row while each button gets 44 px, else two (or three) rows; by the
// card's width (the .kw container: 2 × 10 px padding and the border)
const WRAP: Record<number, string> = {
  3: '@max-[154px]:basis-[45%]',
  4: '@max-[198px]:basis-[45%]',
  5: '@max-[242px]:basis-[30%]',
  6: '@max-[286px]:basis-[30%]',
  7: '@max-[330px]:basis-[22%] @max-[198px]:basis-[30%]',
  8: '@max-[374px]:basis-[22%] @max-[198px]:basis-[30%]',
};

interface ModeButtonsProps {
  modes: string[];
  mode: string;
  onMode: (mode: string) => void;
}

// The hvac_modes as a segmented control; the active one in its color
export const ModeButtons = ({ modes, mode, onMode }: ModeButtonsProps) => (
  <div role="group" aria-label={m.HVAC_MODE()} className="flex flex-wrap overflow-hidden rounded-xl bg-muted">
    {modes.map((value) => {
      const Icon = ICONS[value] ?? ThermometerIcon;
      const active = value === mode;
      return (
        <button
          key={value}
          type="button"
          onClick={() => onMode(value)}
          aria-pressed={active}
          aria-label={modeText(value)}
          title={modeText(value)}
          className={cn(
            'press flex h-11 min-w-0 grow basis-0 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground [&_svg]:size-5',
            WRAP[modes.length],
            active && TONE_ACTIVE[toneOf(value, null)],
            active && 'hover:text-current',
          )}
        >
          <Icon />
        </button>
      );
    })}
  </div>
);
