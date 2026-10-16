import { Tile, type TileStatus } from '../../components/Tile';
import { rgba, useEffects } from '../../contexts/EffectsContext';
import { cn } from '../../lib/utils';
import type { RobotAction, RobotView } from './robotModel';
import { RobotButtons } from './RobotButtons';
import { Battery, FanChip } from './RobotInfo';
import { RobotScene } from './RobotScene';
import { activityText, colorOf, textOf } from './tones';

export interface RobotProps {
  name: string;
  view: RobotView;
  status?: TileStatus;
  onAction: (action: RobotAction) => void;
  onFanSpeed: (speed: string) => void;
  onName?: () => void;
}

// Wide: the scene beside name, state and battery, the suction under them.
// Half wide: the suction across. Narrow (a phone): all stacked, the scene
// across the tile.
const AREAS = {
  fan: "[grid-template-areas:'pic_info'_'pic_fan'_'row_row'] @max-[339px]:[grid-template-areas:'pic_info'_'fan_fan'_'row_row'] @max-[239px]:[grid-template-areas:'info'_'pic'_'fan'_'row']",
  plain: "[grid-template-areas:'pic_info'_'row_row'] @max-[239px]:[grid-template-areas:'info'_'pic'_'row']",
};

// A robot vacuum on its floor or a mower on its lawn: it drives its lanes
// while it works, sits in its station when docked, turns red on an error
export const Robot = ({ name, view, status, onAction, onFanSpeed, onName }: RobotProps) => {
  const effects = useEffects();
  const { kind, activity } = view;
  const color = colorOf(kind, activity);
  const busy = activity === 'working' || activity === 'returning';

  return (
    <Tile
      status={status}
      role="group"
      aria-label={name}
      style={effects.on && busy ? { boxShadow: `0 24px 60px -30px ${rgba(color, 0.5 * effects.k)}` } : undefined}
    >
      <div
        className={cn(
          'grid grid-cols-[auto_minmax(0,1fr)] gap-x-3.5 gap-y-2 p-3.5 @max-[239px]:grid-cols-1',
          AREAS[view.fan ? 'fan' : 'plain'],
        )}
      >
        <RobotScene
          kind={kind}
          activity={activity}
          color={color}
          className="w-[132px] [grid-area:pic] @max-[339px]:w-[108px] @max-[239px]:w-full"
        />
        <button type="button" onClick={onName} className="flex min-w-0 flex-col gap-1 self-start text-left [grid-area:info]">
          <span className="line-clamp-2 text-[15px] leading-snug font-medium break-words" title={name}>
            {name}
          </span>
          {/* What it does and its battery on one line, as far as they fit */}
          <span className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
            <span role="status" className={cn('text-[13px] font-medium', textOf(kind, activity))}>
              {activityText(kind, activity)}
            </span>
            {view.battery !== null && <Battery percent={view.battery} charging={activity === 'docked'} />}
          </span>
        </button>
        {view.fan && <FanChip fan={view.fan} onChange={onFanSpeed} className="self-end [grid-area:fan]" />}
        <RobotButtons view={view} onAction={onAction} className="[grid-area:row]" />
      </div>
    </Tile>
  );
};
