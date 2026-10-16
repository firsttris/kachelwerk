import { Tile, type TileStatus } from '../../components/Tile';
import { LevelBar } from '../../components/light/LevelBar';
import { litTileStyle, PendantLamp, type RGB, WARM } from '../../components/light/PendantLamp';
import { useEffects } from '../../contexts/EffectsContext';
import { useHold } from '../../hooks/useHold';
import { m } from '../../i18n/messages';
import { cn } from '../../lib/utils';
import { useStateChanges } from './useStateChanges';

export interface DimmerTileProps {
  name: string;
  // 0..100
  level: number;
  color?: RGB;
  status?: TileStatus;
  onToggle: () => void;
  onLevel: (percent: number) => void;
  onHold?: () => void;
}

// MUI's DimmerControl: a tap switches on (at the last brightness, HA keeps
// it) or off, the bar sets the brightness. The lamp's light follows it.
export const DimmerTile = ({ name, level, color = WARM, status, onToggle, onLevel, onHold }: DimmerTileProps) => {
  const effects = useEffects();
  const on = level > 0;
  const { changes, external, markRequested } = useStateChanges(on);
  const hold = useHold(onHold);
  const toggle = hold.wrapClick(() => {
    markRequested(!on);
    onToggle();
  });

  const state = on ? m.DIMMED_TO({ percent: level }) : m.OFF();
  return (
    <Tile
      status={status}
      lit={on}
      className={cn(effects.on && external && 'fx-flash')}
      style={litTileStyle(level / 100, color, effects.on, effects.k)}
    >
      <button
        type="button"
        onClick={toggle}
        {...hold.handlers}
        aria-pressed={on}
        aria-label={`${name}: ${state}`}
        className="press relative flex h-[112px] flex-col items-start justify-end overflow-hidden px-3.5 pb-2 text-left"
      >
        <PendantLamp level={level / 100} color={color} changes={changes} />
        <span className="relative flex w-full min-w-0 flex-col gap-0.5">
          <span className="line-clamp-2 text-[15px] leading-snug font-medium" title={name}>
            {name}
          </span>
          <span className={cn('text-[13px]', on ? 'text-amber-700 dark:text-amber-300' : 'text-muted-foreground')}>
            {external ? m.AT_DEVICE({ state }) : state}
          </span>
        </span>
      </button>
      <div className="flex flex-col gap-2 px-3.5 pb-3.5">
        <LevelBar label={m.BRIGHTNESS_OF({ name })} value={level} color={color} onChange={onLevel} />
      </div>
    </Tile>
  );
};
