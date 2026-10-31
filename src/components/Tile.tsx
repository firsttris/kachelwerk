import type { ComponentChildren, HTMLAttributes } from 'preact';
import RadioIcon from '~icons/lucide/radio-tower';
import BatteryLowIcon from '~icons/lucide/battery-low';
import { cn } from '../lib/utils';
import { m } from '../i18n/messages';
import { useEffects } from '../contexts/EffectsContext';

// Reachability and battery of the device, as MUI's ChannelStatus
export interface TileStatus {
  UNREACH?: boolean;
  LOW_BAT?: boolean;
}

const StatusStrip = ({
  severity,
  icon,
  children,
}: {
  severity: 'warning' | 'error';
  icon: ComponentChildren;
  children: ComponentChildren;
}) => (
  <div
    role="status"
    className={cn(
      'flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium [&_svg]:size-3.5',
      severity === 'error'
        ? 'bg-red-500/15 text-red-700 dark:text-red-300'
        : 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
    )}
  >
    {icon}
    {children}
  </div>
);

type TileProps = HTMLAttributes<HTMLDivElement> & {
  status?: TileStatus;
  // Lit tiles bring their own background (no light edge)
  lit?: boolean;
};

// The surface of a control: MUI's tile, with the corners, border and shadow
// of the HA theme's cards (ha-card variables)
export const Tile = ({ className, status, lit, children, style, ...props }: TileProps) => {
  const effects = useEffects();
  return (
    <div
      data-slot="tile"
      data-lit={lit || undefined}
      data-effects={effects.level}
      className={cn(
        'tile-edge relative flex h-full flex-col overflow-hidden border bg-card text-card-foreground transition-[box-shadow,background,border-color] duration-500',
        className as string,
      )}
      style={{
        borderRadius: 'var(--ha-card-border-radius, 16px)',
        borderWidth: 'var(--ha-card-border-width, 1px)',
        boxShadow: 'var(--ha-card-box-shadow, none)',
        ...(style as object),
      }}
      {...props}
    >
      {/* The values of an unreachable device are stale */}
      <div className={cn('flex min-h-0 flex-1 flex-col', status?.UNREACH && 'opacity-45 grayscale')}>{children}</div>
      {status?.UNREACH && (
        <StatusStrip severity="error" icon={<RadioIcon />}>
          {m.UNREACH()}
        </StatusStrip>
      )}
      {status?.LOW_BAT && (
        <StatusStrip severity="warning" icon={<BatteryLowIcon />}>
          {m.LOW_BAT()}
        </StatusStrip>
      )}
    </div>
  );
};
