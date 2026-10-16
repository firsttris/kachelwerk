import { m } from '../../i18n/messages';
import { cn } from '../../lib/utils';
import { type Mode, toneOf } from './alarmModel';
import { actionText, MODE_ICON, TONE_ACTIVE, TONE_RING } from './modes';

// One row while each button gets 44 px, else two rows; by the card's width
// (the .kw container: 2 × 14 px padding and the border)
const WRAP: Record<number, string> = {
  3: '@max-[162px]:basis-[45%]',
  4: '@max-[206px]:basis-[45%]',
  5: '@max-[250px]:basis-[30%]',
  6: '@max-[294px]:basis-[30%]',
};

interface ModeBarProps {
  modes: Mode[];
  // The mode the panel is in
  active: Mode | null;
  // The mode waiting for its code
  chosen: Mode | null;
  disabled?: boolean;
  onMode: (mode: Mode) => void;
}

// Disarmed and the arm modes as a segmented control: the active one in its
// color, the one waiting for the code outlined
export const ModeBar = ({ modes, active, chosen, disabled, onMode }: ModeBarProps) => (
  <div role="group" aria-label={m.ALARM_MODES()} className="flex flex-wrap overflow-hidden rounded-xl bg-muted">
    {modes.map((mode) => {
      const Icon = MODE_ICON[mode];
      const on = mode === active;
      return (
        <button
          key={mode}
          type="button"
          disabled={disabled}
          onClick={() => onMode(mode)}
          aria-pressed={on}
          aria-expanded={mode === chosen}
          aria-label={actionText(mode)}
          title={actionText(mode)}
          className={cn(
            'press flex h-11 min-w-0 grow basis-0 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground disabled:opacity-50 [&_svg]:size-5',
            WRAP[modes.length],
            on && TONE_ACTIVE[toneOf(mode)],
            on && 'hover:text-current',
            mode === chosen && cn('bg-background ring-2 ring-inset', TONE_RING[toneOf(mode)]),
          )}
        >
          <Icon />
        </button>
      );
    })}
  </div>
);
