import { useEffect, useRef, useState } from 'preact/hooks';
import SirenIcon from '~icons/lucide/siren';
import { m } from '../../i18n/messages';
import { cn } from '../../lib/utils';

const HOLD_MS = 800;

// The alarm by hand (alarm_trigger): a round button that has to be held,
// a red ring fills meanwhile, so wiping the tablet sets nothing off.
// Space or Enter held down works the same.
export const PanicButton = ({ onTrigger, disabled }: { onTrigger: () => void; disabled?: boolean }) => {
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  };
  // biome-ignore lint/correctness/useExhaustiveDependencies: cleanup on unmount only; stop reads a ref
  useEffect(() => stop, []);
  const begin = () => {
    if (disabled || timer.current) return;
    setHolding(true);
    timer.current = setTimeout(() => {
      stop();
      onTrigger();
    }, HOLD_MS);
  };

  const r = 20;
  const circumference = 2 * Math.PI * r;
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={m.ALARM_TRIGGER()}
      title={`${m.ALARM_TRIGGER()} · ${m.HOLD_TO_CONFIRM()}`}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        begin();
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onPointerLeave={stop}
      onKeyDown={(event) => {
        if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
          event.preventDefault();
          begin();
        }
      }}
      onKeyUp={(event) => {
        if (event.key === ' ' || event.key === 'Enter') stop();
      }}
      onContextMenu={(event) => event.preventDefault()}
      className="press relative flex size-11 shrink-0 touch-none items-center justify-center rounded-full border bg-background/60 text-muted-foreground select-none hover:text-red-600 disabled:opacity-40 dark:hover:text-red-400 [&>span_svg]:size-5"
    >
      <svg aria-hidden viewBox="0 0 44 44" className="absolute -inset-px size-11 -rotate-90">
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          className={cn('stroke-red-500', holding ? 'opacity-100' : 'opacity-0')}
          strokeDasharray={circumference}
          strokeDashoffset={holding ? 0 : circumference}
          style={{ transition: holding ? `stroke-dashoffset ${HOLD_MS}ms linear` : 'none' }}
        />
      </svg>
      <span className={cn('relative flex', holding && 'text-red-600 dark:text-red-400')}>
        <SirenIcon />
      </span>
    </button>
  );
};
