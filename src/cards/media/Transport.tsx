import PlayIcon from '~icons/lucide/play';
import PauseIcon from '~icons/lucide/pause';
import StopIcon from '~icons/lucide/square';
import PreviousIcon from '~icons/lucide/skip-back';
import NextIcon from '~icons/lucide/skip-forward';
import { m } from '../../i18n/messages';
import { cn } from '../../lib/utils';
import { round } from './Volume';

// Lucide draws outlines (fill="none" on each shape): filled, the symbols
// read as the buttons of a player
const FILLED = '[&_*]:fill-current';

const PLAY = {
  play: { icon: PlayIcon, label: m.MEDIA_PLAY },
  pause: { icon: PauseIcon, label: m.MEDIA_PAUSE },
  stop: { icon: StopIcon, label: m.MEDIA_STOP },
};

export interface TransportProps {
  play: 'play' | 'pause' | 'stop' | null;
  canPrevious: boolean;
  canNext: boolean;
  glow?: string;
  onPlay: () => void;
  onTrack: (direction: 'previous' | 'next') => void;
}

// Previous, play/pause, next: each only where the player supports it
export const Transport = ({ play, canPrevious, canNext, glow, onPlay, onTrack }: TransportProps) => {
  if (!play && !canPrevious && !canNext) return null;
  const Play = play ? PLAY[play] : null;
  return (
    <div className="flex items-center justify-center gap-3 @min-[340px]:gap-1.5 @max-[200px]:gap-1">
      {canPrevious && (
        <button type="button" onClick={() => onTrack('previous')} aria-label={m.MEDIA_PREVIOUS()} title={m.MEDIA_PREVIOUS()} className={cn(round, 'text-foreground')}>
          <PreviousIcon className={FILLED} />
        </button>
      )}
      {Play && (
        <button
          type="button"
          onClick={onPlay}
          aria-label={Play.label()}
          title={Play.label()}
          className={cn(
            'press flex size-12 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400 [&_svg]:size-5',
            play === 'play' && '[&_svg]:translate-x-px',
          )}
          style={glow ? { boxShadow: glow } : undefined}
        >
          <Play.icon className={FILLED} />
        </button>
      )}
      {canNext && (
        <button type="button" onClick={() => onTrack('next')} aria-label={m.MEDIA_NEXT()} title={m.MEDIA_NEXT()} className={cn(round, 'text-foreground')}>
          <NextIcon className={FILLED} />
        </button>
      )}
    </div>
  );
};
