import type { ComponentType } from 'preact';
import FanIcon from '~icons/lucide/fan';
import MoveVerticalIcon from '~icons/lucide/move-vertical';
import MoveHorizontalIcon from '~icons/lucide/move-horizontal';
import SlidersIcon from '~icons/lucide/sliders-horizontal';
import ChevronDownIcon from '~icons/lucide/chevron-down';
import { m } from '../../i18n/messages';
import type { AirconView, Choice } from './airconModel';
import { optionText } from './labels';

export type ChoiceKind = 'fan' | 'swing' | 'swingHorizontal' | 'preset';

const KINDS: { kind: ChoiceKind; label: () => string; icon: ComponentType<{ className?: string }> }[] = [
  { kind: 'fan', label: m.FAN_MODE, icon: FanIcon },
  { kind: 'swing', label: m.SWING_MODE, icon: MoveVerticalIcon },
  { kind: 'swingHorizontal', label: m.SWING_HORIZONTAL_MODE, icon: MoveHorizontalIcon },
  { kind: 'preset', label: m.PRESET_MODE, icon: SlidersIcon },
];

// A chip with the setting's name and value; the native select over it
// opens the phone's own picker
const Chip = ({
  label,
  icon: Icon,
  choice,
  onChange,
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  choice: Choice;
  onChange: (value: string) => void;
}) => (
  // On a narrow card the value keeps the room: no icon below 280 px
  <label className="press relative flex h-11 min-w-0 grow basis-[72px] items-center gap-1.5 rounded-xl border bg-background/60 px-2.5 hover:bg-accent focus-within:ring-2 focus-within:ring-ring/50 @max-[200px]:px-2">
    <Icon className="size-4 shrink-0 text-muted-foreground @max-[280px]:hidden" />
    <span className="flex min-w-0 flex-1 flex-col leading-tight">
      <span className="flex items-center gap-0.5 text-[10px] tracking-[0.04em] text-muted-foreground uppercase">
        <span className="truncate">{label}</span>
        <ChevronDownIcon className="size-3 shrink-0" />
      </span>
      <span className="truncate text-[13px] font-medium">{optionText(choice.value)}</span>
    </span>
    <select
      aria-label={label}
      value={choice.value}
      onChange={(event) => onChange(event.currentTarget.value)}
      className="absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
    >
      {/* A value HA reports but doesn't list stays selectable as it is */}
      {!choice.options.includes(choice.value) && <option value={choice.value}>{optionText(choice.value)}</option>}
      {choice.options.map((option) => (
        <option key={option} value={option}>
          {optionText(option)}
        </option>
      ))}
    </select>
  </label>
);

// Fan speed, swing and preset, as far as the unit has them
export const OptionChips = ({
  view,
  onChoice,
}: {
  view: AirconView;
  onChoice: (kind: ChoiceKind, value: string) => void;
}) => {
  const shown = KINDS.filter(({ kind }) => view[kind]);
  if (shown.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map(({ kind, label, icon }) => (
        <Chip
          key={kind}
          label={label()}
          icon={icon}
          choice={view[kind] as Choice}
          onChange={(value) => onChoice(kind, value)}
        />
      ))}
    </div>
  );
};
