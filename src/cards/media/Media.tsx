import PowerIcon from '~icons/lucide/power';
import { Tile, type TileStatus } from '../../components/Tile';
import { rgba, useEffects } from '../../contexts/EffectsContext';
import { m } from '../../i18n/messages';
import { cn } from '../../lib/utils';
import { Backdrop, Cover } from './Artwork';
import { Equalizer, ProgressLine } from './Equalizer';
import { stateText, VIOLET } from './labels';
import { type ChoiceKind, MediaChips } from './MediaChips';
import { type MediaView, playButton } from './mediaModel';
import { Transport } from './Transport';
import { round, Volume } from './Volume';

export interface MediaProps {
  name: string;
  view: MediaView;
  status?: TileStatus;
  onPlay: () => void;
  onTrack: (direction: 'previous' | 'next') => void;
  onPower: () => void;
  onVolume: (percent: number) => void;
  onStep: (direction: 'up' | 'down') => void;
  onMute: () => void;
  onChoice: (kind: ChoiceKind, value: string) => void;
  onName?: () => void;
}

// A media player: what plays with its cover (and the cover blurred behind
// the tile), play/pause and the tracks, the volume, source and sound mode.
// Off it is only its name and the power button.
export const Media = ({ name, view, status, onPlay, onTrack, onPower, onVolume, onStep, onMute, onChoice, onName }: MediaProps) => {
  const effects = useEffects();
  const { off, playing, active } = view;
  const glow = (spread: number, alpha: number) =>
    playing && effects.on ? `0 ${spread / 2}px ${spread}px -${spread / 3}px ${rgba(VIOLET, alpha * effects.k)}` : undefined;
  const statusLine = [stateText(view.state), view.from].filter(Boolean).join(' · ');
  const hasMedia = !off && (view.title !== null || view.picture !== null);

  return (
    <Tile
      status={status}
      role="group"
      aria-label={name}
      style={playing && effects.on ? { boxShadow: `0 24px 60px -28px ${rgba(VIOLET, 0.5 * effects.k)}` } : undefined}
    >
      <Backdrop picture={view.picture} dim={!active} />
      <div className="relative flex flex-col gap-3 p-3.5">
        <div className="flex items-start gap-2">
          <button type="button" onClick={onName} className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5 text-left">
            <span className="line-clamp-2 text-[15px] leading-snug font-medium break-words" title={name}>
              {name}
            </span>
            <span
              role="status"
              className={cn(
                'flex min-w-0 items-center gap-1.5 text-[13px] font-medium',
                active ? 'text-violet-700 dark:text-violet-300' : 'text-muted-foreground',
              )}
            >
              {active && <Equalizer moving={playing} />}
              <span className="truncate">{statusLine}</span>
            </span>
          </button>
          {view.power && (
            <button
              type="button"
              onClick={onPower}
              aria-pressed={!off}
              aria-label={off ? m.POWER_ON() : m.POWER_OFF()}
              title={off ? m.POWER_ON() : m.POWER_OFF()}
              className={cn(round, '-mt-1 -mr-1.5', off ? 'text-muted-foreground' : 'text-foreground/80')}
            >
              <PowerIcon />
            </button>
          )}
        </div>

        {hasMedia && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <Cover picture={view.picture} deviceClass={view.deviceClass} glow={glow(28, 0.45)} />
              <div className="flex min-w-0 flex-col gap-0.5">
                {view.title && (
                  <span className="line-clamp-2 text-[15px] leading-snug font-semibold break-words" title={view.title}>
                    {view.title}
                  </span>
                )}
                {view.subtitle && <span className="truncate text-[13px] text-muted-foreground">{view.subtitle}</span>}
              </div>
            </div>
            {view.progress && <ProgressLine progress={view.progress} playing={playing} />}
          </div>
        )}

        {!off && (
          <>
            {/* On a wide card the buttons and the volume share a row */}
            <div className="flex flex-col gap-3 @min-[340px]:flex-row @min-[340px]:items-center @min-[340px]:gap-4">
              <Transport
                play={playButton(view)}
                canPrevious={view.canPrevious}
                canNext={view.canNext}
                glow={glow(20, 0.55)}
                onPlay={onPlay}
                onTrack={onTrack}
              />
              <Volume
                name={name}
                volume={view.volume}
                muted={view.muted}
                canSet={view.canSetVolume}
                canStep={view.canStepVolume}
                canMute={view.canMute}
                onVolume={onVolume}
                onStep={onStep}
                onMute={onMute}
              />
            </div>
            <MediaChips source={view.source} soundMode={view.soundMode} onChoice={onChoice} />
          </>
        )}
      </div>
    </Tile>
  );
};
