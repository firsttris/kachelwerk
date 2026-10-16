import type { ComponentType } from 'preact';
import ChevronDownIcon from '~icons/lucide/chevron-down';
import InputIcon from '~icons/lucide/log-in';
import SoundIcon from '~icons/lucide/audio-lines';
import { m } from '../../i18n/messages';
import { cn } from '../../lib/utils';
import type { Choice } from './mediaModel';

export type ChoiceKind = 'source' | 'soundMode';

const KINDS: { kind: ChoiceKind; label: () => string; icon: ComponentType<{ className?: string }> }[] = [
  { kind: 'source', label: m.MEDIA_SOURCE, icon: InputIcon },
  { kind: 'soundMode', label: m.SOUND_MODE, icon: SoundIcon },
];

// A chip with the setting's name and value, as the air conditioner's; the
// native select over it opens the phone's own picker. Sources and sound
// modes are the player's own names, shown as they are.
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
  <label className="press relative flex h-11 min-w-0 grow basis-[96px] items-center gap-1.5 rounded-xl border bg-background/60 px-2.5 hover:bg-accent focus-within:ring-2 focus-within:ring-ring/50 @max-[200px]:px-2">
    <Icon className="size-4 shrink-0 text-muted-foreground @max-[280px]:hidden" />
    <span className="flex min-w-0 flex-1 flex-col leading-tight">
      <span className="flex items-center gap-0.5 text-[10px] tracking-[0.04em] text-muted-foreground uppercase">
        <span className="truncate">{label}</span>
        <ChevronDownIcon className="size-3 shrink-0" />
      </span>
      <span className={cn('truncate text-[13px] font-medium', !choice.value && 'text-muted-foreground')}>
        {choice.value || '–'}
      </span>
    </span>
    <select
      aria-label={label}
      value={choice.value}
      onChange={(event) => onChange(event.currentTarget.value)}
      className="absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
    >
      {/* A value HA reports but doesn't list stays selectable as it is */}
      {!choice.options.includes(choice.value) && <option value={choice.value}>{choice.value || '–'}</option>}
      {choice.options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

// Source and sound mode, as far as the player has them
export const MediaChips = ({
  source,
  soundMode,
  onChoice,
}: {
  source: Choice | null;
  soundMode: Choice | null;
  onChoice: (kind: ChoiceKind, value: string) => void;
}) => {
  const choices = { source, soundMode };
  const shown = KINDS.filter(({ kind }) => choices[kind]);
  if (shown.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map(({ kind, label, icon }) => (
        <Chip key={kind} label={label()} icon={icon} choice={choices[kind] as Choice} onChange={(value) => onChoice(kind, value)} />
      ))}
    </div>
  );
};
