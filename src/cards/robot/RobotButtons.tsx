import type { ComponentChildren } from 'preact';
import PlayIcon from '~icons/lucide/play';
import PauseIcon from '~icons/lucide/pause';
import SquareIcon from '~icons/lucide/square';
import HouseIcon from '~icons/lucide/house';
import CircleDotIcon from '~icons/lucide/circle-dot';
import MapPinIcon from '~icons/lucide/map-pin';
import { m } from '../../i18n/messages';
import { cn } from '../../lib/utils';
import type { RobotAction, RobotView } from './robotModel';

const button =
  'press flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl border bg-background/60 px-2 text-[13px] font-medium hover:bg-accent @max-[239px]:gap-1 @max-[239px]:px-1.5 disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0';

const PRIMARY = {
  start: { icon: <PlayIcon />, label: (resume: boolean) => (resume ? m.ROBOT_RESUME() : m.ROBOT_START()) },
  pause: { icon: <PauseIcon />, label: () => m.ROBOT_PAUSE() },
  stop: { icon: <SquareIcon className="fill-current !size-3.5" />, label: () => m.BLIND_STOP() },
};

const Labeled = ({
  icon,
  label,
  hide,
  ...props
}: {
  icon: ComponentChildren;
  label: string;
  hide: string;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button type="button" className={cn(button, 'flex-1')} title={label} {...props}>
    {icon}
    <span className={cn('truncate', hide)}>{label}</span>
  </button>
);

// Start or pause, back to the station; spot cleaning and locate as icons
// where the vacuum has them
export const RobotButtons = ({
  view,
  onAction,
  className,
}: {
  view: RobotView;
  onAction: (action: RobotAction) => void;
  className?: string;
}) => {
  const { primary, activity } = view;
  const icons = Number(view.canSpot) + Number(view.canLocate);
  // With two icon buttons beside them, the labels go first on a half-wide
  // card; below 240 px the buttons stand in two columns with their labels
  const hide = icons === 2 ? '@min-[240px]:@max-[329px]:sr-only' : icons === 1 ? '@min-[240px]:@max-[279px]:sr-only' : '';
  if (!primary && !view.canDock && icons === 0) return null;
  return (
    <div
      className={cn(
        'flex gap-2 @max-[239px]:grid @max-[239px]:grid-cols-2 @max-[239px]:[&>:last-child:nth-child(odd)]:col-span-2',
        className,
      )}
    >
      {primary && (
        <Labeled
          icon={PRIMARY[primary].icon}
          label={PRIMARY[primary].label(activity === 'paused')}
          hide={hide}
          onClick={() => onAction(primary)}
        />
      )}
      {view.canDock && (
        <Labeled
          icon={<HouseIcon />}
          label={m.ROBOT_DOCK()}
          hide={hide}
          disabled={activity === 'docked' || activity === 'returning'}
          onClick={() => onAction('dock')}
        />
      )}
      {view.canSpot && (
        <button type="button" className={cn(button, 'w-11 shrink-0 @max-[239px]:w-auto')} aria-label={m.ROBOT_SPOT()} title={m.ROBOT_SPOT()} onClick={() => onAction('spot')}>
          <CircleDotIcon />
        </button>
      )}
      {view.canLocate && (
        <button type="button" className={cn(button, 'w-11 shrink-0 @max-[239px]:w-auto')} aria-label={m.ROBOT_LOCATE()} title={m.ROBOT_LOCATE()} onClick={() => onAction('locate')}>
          <MapPinIcon />
        </button>
      )}
    </div>
  );
};
