import type { ComponentChildren as ReactNode } from 'preact';
import { Tile, type TileStatus } from '../../components/Tile';
import { cn } from '../../lib/utils';

export const button =
  'press flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border bg-background/60 text-[13px] font-medium hover:bg-accent disabled:opacity-50 [&_svg]:size-4 @max-[300px]:px-1 @max-[300px]:[&_svg]:hidden';

// An icon-only button (stop) keeps its icon on a narrow card
export const iconOnly = '@max-[300px]:[&_svg]:!block';

// From MUI's WaterControls: a device with a name, a status line and buttons
// below
export const ActuatorTile = ({
  name,
  tileStatus,
  onName,
  status,
  active,
  icon,
  children,
}: {
  name: string;
  tileStatus?: TileStatus;
  onName?: () => void;
  status: string;
  active: boolean;
  icon: ReactNode;
  children: ReactNode;
}) => (
  <Tile status={tileStatus} role="group" aria-label={name} lit={active}>
    <div className="flex items-center gap-3 p-4 pb-3">
      <span
        aria-hidden
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-full border [&_svg]:size-5',
          active
            ? 'border-sky-500/40 bg-sky-500/15 text-sky-600 dark:text-sky-300'
            : 'bg-muted/50 text-muted-foreground',
        )}
      >
        {icon}
      </span>
      <button type="button" onClick={onName} className="flex min-w-0 flex-col gap-0.5 text-left">
        <span className="line-clamp-2 text-[15px] leading-snug font-medium" title={name}>
          {name}
        </span>
        <span
          role="status"
          className={cn('text-[13px] font-medium', active ? 'text-sky-700 dark:text-sky-300' : 'text-muted-foreground')}
        >
          {status}
        </span>
      </button>
    </div>
    <div className="flex flex-col gap-2 px-4 pb-4">{children}</div>
  </Tile>
);
