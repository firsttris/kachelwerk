import type { ComponentChildren as ReactNode } from 'preact';
import { useEffects } from '../../contexts/EffectsContext';
import { Tile, type TileStatus } from '../../components/Tile';
import { cn } from '../../lib/utils';

// From MUI's DetectorControls: the emblem with waves, the smoke detector
// seen from below, and the tile around them

export type Tone = 'calm' | 'active' | 'alarm';

const toneRgb: Record<Tone, string> = { calm: '34,197,94', active: '56,189,248', alarm: '239,68,68' };
const toneText: Record<Tone, string> = {
  calm: 'text-green-700 dark:text-green-300',
  active: 'text-sky-700 dark:text-sky-300',
  alarm: 'text-red-600 dark:text-red-400',
};

// A round emblem with waves spreading from it while something happens
const Emblem = ({ tone, waves, children }: { tone: Tone; waves: boolean; children: ReactNode }) => {
  const effects = useEffects();
  const rgb = toneRgb[tone];
  return (
    <div className="relative flex size-14 shrink-0 items-center justify-center">
      {effects.on &&
        waves &&
        [0, 0.6, 1.2].map((delay) => (
          <span
            key={delay}
            aria-hidden
            className="fx-wave absolute inset-0 rounded-full border-2"
            style={{ borderColor: `rgba(${rgb},0.55)`, animationDelay: `${delay}s` }}
          />
        ))}
      <div
        className={cn(
          'relative flex size-12 items-center justify-center rounded-full border [&_svg]:size-6',
          toneText[tone],
        )}
        style={{
          background: `rgba(${rgb},0.12)`,
          borderColor: `rgba(${rgb},0.35)`,
          boxShadow:
            effects.on && tone !== 'calm'
              ? `0 0 ${18 * effects.k}px rgba(${rgb},${Math.min(1, 0.45 * effects.k)})`
              : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// A smoke detector seen from below: the vents in a ring, the test button in
// the middle and the LED beside it. Calm, the LED flashes green now and
// then, as the HmIP-SWSD does; on alarm it blinks red and smoke rises.
export const SmokeDetectorPicture = ({ alarm }: { alarm: boolean }) => {
  const effects = useEffects();
  return (
    <div aria-hidden className="relative flex size-14 shrink-0 items-center justify-center">
      {effects.on &&
        alarm &&
        [0, 0.6, 1.2].map((delay) => (
          <span
            key={delay}
            className="fx-wave absolute inset-0 rounded-full border-2"
            style={{ borderColor: `rgba(${toneRgb.alarm},0.55)`, animationDelay: `${delay}s` }}
          />
        ))}
      <div
        className="relative size-[52px] rounded-full border border-zinc-300 bg-[radial-gradient(circle_at_35%_30%,#ffffff,#e4e4e7)] shadow-[0_2px_6px_rgba(0,0,0,0.15)] dark:border-zinc-500 dark:bg-[radial-gradient(circle_at_35%_30%,#e4e4e7,#a1a1aa)]"
        style={
          alarm && effects.on
            ? { boxShadow: `0 0 ${18 * effects.k}px rgba(${toneRgb.alarm},${Math.min(1, 0.5 * effects.k)})` }
            : undefined
        }
      >
        {/* The vents */}
        <div className="absolute inset-[5px] rounded-full bg-[repeating-conic-gradient(rgba(113,113,122,0.45)_0_7deg,transparent_7deg_20deg)] [mask:radial-gradient(circle,transparent_58%,black_60%,black_92%,transparent_94%)]" />
        {/* The test button */}
        <div className="absolute inset-[16px] rounded-full border border-zinc-300 bg-[radial-gradient(circle_at_40%_35%,#ffffff,#d4d4d8)] dark:border-zinc-400" />
        {/* The LED */}
        <span
          className={cn(
            'absolute top-[11px] right-[13px] size-[5px] rounded-full',
            alarm
              ? 'bg-red-500 shadow-[0_0_6px_2px_rgba(239,68,68,0.8)]'
              : 'bg-green-500 shadow-[0_0_5px_1px_rgba(34,197,94,0.8)]',
            effects.on ? (alarm ? 'fx-led-alarm' : 'fx-led') : alarm ? '' : 'opacity-0',
          )}
        />
      </div>
      {/* Smoke drifting up into it */}
      {effects.on &&
        alarm &&
        [
          { left: '18%', delay: 0 },
          { left: '50%', delay: 0.9 },
          { left: '72%', delay: 1.8 },
        ].map(({ left, delay }) => (
          <span
            key={left}
            className="fx-smoke absolute top-1/2 size-6 -translate-x-1/2 rounded-full bg-zinc-400/60 blur-[3px] dark:bg-zinc-300/40"
            style={{ left, animationDelay: `${delay}s` }}
          />
        ))}
    </div>
  );
};

export const DetectorTile = ({
  name,
  tileStatus,
  onName,
  tone,
  waves,
  icon,
  picture,
  status,
  detail,
  children,
}: {
  name: string;
  tileStatus?: TileStatus;
  onName?: () => void;
  tone: Tone;
  waves: boolean;
  icon?: ReactNode;
  // Drawn instead of the round emblem with the icon
  picture?: ReactNode;
  status: string;
  detail?: ReactNode;
  children?: ReactNode;
}) => {
  const effects = useEffects();
  const alarm = tone === 'alarm';
  return (
    <Tile
      status={tileStatus}
      role="group"
      aria-label={name}
      lit={alarm}
      className={cn(alarm && 'border-red-500/50', alarm && effects.on && 'fx-alarm')}
      style={
        tone !== 'calm' && effects.on
          ? {
              background: `radial-gradient(80% 90% at 0% 30%, rgba(${toneRgb[tone]},${Math.min(1, (alarm ? 0.2 : 0.1) * effects.k)}), transparent 70%), var(--card)`,
            }
          : undefined
      }
    >
      <div className="flex flex-col gap-3 p-3.5">
        <div className="flex items-center gap-3">
          {picture ?? (
            <Emblem tone={tone} waves={waves}>
              {icon}
            </Emblem>
          )}
          <button type="button" onClick={onName} className="flex min-w-0 flex-col gap-0.5 text-left">
            <span className="line-clamp-2 text-[15px] leading-snug font-medium" title={name}>
              {name}
            </span>
            <span
              role="status"
              className={cn(
                'text-[13px] font-medium',
                alarm ? toneText.alarm : tone === 'active' ? toneText.active : 'text-muted-foreground',
              )}
            >
              {status}
            </span>
            {detail && <span className="text-xs text-muted-foreground">{detail}</span>}
          </button>
        </div>
        {children}
      </div>
    </Tile>
  );
};

