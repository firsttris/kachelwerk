import { useState } from 'preact/hooks';
import MusicIcon from '~icons/lucide/music';
import TvIcon from '~icons/lucide/tv';
import SpeakerIcon from '~icons/lucide/speaker';
import ProjectorIcon from '~icons/lucide/projector';
import { cn } from '../../lib/utils';

// The device's own icon where there is no cover (MediaPlayerDeviceClass)
const DEVICE_ICON: Record<string, typeof MusicIcon> = {
  tv: TvIcon,
  speaker: SpeakerIcon,
  receiver: SpeakerIcon,
  projector: ProjectorIcon,
};

// A picture that may not load (the proxy's token expired, the player is
// gone): it is left out then
const usePicture = (picture: string | null) => {
  const [failed, setFailed] = useState<string | null>(null);
  return { src: picture && picture !== failed ? picture : null, onError: () => setFailed(picture) };
};

// The cover small, or the device's icon in its place
export const Cover = ({ picture, deviceClass, glow }: { picture: string | null; deviceClass: string | null; glow?: string }) => {
  const { src, onError } = usePicture(picture);
  const Icon = DEVICE_ICON[deviceClass ?? ''] ?? MusicIcon;
  return (
    <span
      aria-hidden
      className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/60 text-muted-foreground transition-shadow duration-500 @max-[200px]:size-12 [&_svg]:size-6"
      style={glow ? { boxShadow: glow } : undefined}
    >
      {src ? <img src={src} alt="" onError={onError} className="size-full object-cover" /> : <Icon />}
    </span>
  );
};

// The cover blurred behind the whole tile, faded into the card's color so
// the texts stay readable
export const Backdrop = ({ picture, dim }: { picture: string | null; dim: boolean }) => {
  const { src, onError } = usePicture(picture);
  if (!src) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <img
        src={src}
        alt=""
        onError={onError}
        className={cn(
          'absolute inset-0 size-full scale-150 object-cover blur-2xl transition-opacity duration-700',
          dim ? 'opacity-20' : 'opacity-50 dark:opacity-40',
        )}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--card) 30%, transparent), color-mix(in srgb, var(--card) 80%, transparent) 70%)',
        }}
      />
    </div>
  );
};
