import type { ComponentType } from 'preact';
import { cn } from '../../lib/utils';

interface ToggleChipProps {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  // Tinted while on (oscillating); a switch between two values (the
  // direction) has no pressed state
  pressed?: boolean;
  activeClass?: string;
  onClick: () => void;
}

// A setting with two values as a chip like the air conditioner's choices
// (OptionChips): its name small, the value below; a tap switches it
export const ToggleChip = ({ label, value, icon: Icon, pressed, activeClass, onClick }: ToggleChipProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={pressed}
    aria-label={`${label}: ${value}`}
    className={cn(
      'press flex h-11 min-w-0 grow basis-[72px] items-center gap-1.5 rounded-xl border px-2.5 text-left @max-[200px]:px-2',
      pressed ? cn(activeClass, 'border-transparent') : 'bg-background/60 hover:bg-accent',
    )}
  >
    <Icon className={cn('size-4 shrink-0 @max-[280px]:hidden', !pressed && 'text-muted-foreground')} />
    <span className="flex min-w-0 flex-1 flex-col leading-tight">
      <span className={cn('truncate text-[10px] tracking-[0.04em] uppercase', pressed ? 'opacity-80' : 'text-muted-foreground')}>
        {label}
      </span>
      <span className="truncate text-[13px] font-medium">{value}</span>
    </span>
  </button>
);
