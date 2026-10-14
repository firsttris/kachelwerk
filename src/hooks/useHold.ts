import { useEffect, useRef } from 'preact/hooks';

// How long a press must last to count as holding
const HOLD_MS = 500;

// Holding a tile opens HA's more-info dialog, as HA's own cards do; the
// click that ends the press is then swallowed. Moving the pointer away
// (a scroll on a touch screen) cancels the hold.
export const useHold = (onHold?: () => void) => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const held = useRef(false);
  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => clear, []);
  if (!onHold) return { handlers: {}, wrapClick: (fn: () => void) => fn };
  return {
    handlers: {
      onPointerDown: () => {
        held.current = false;
        clear();
        timer.current = setTimeout(() => {
          held.current = true;
          onHold();
        }, HOLD_MS);
      },
      onPointerUp: clear,
      onPointerLeave: clear,
      onPointerCancel: clear,
      onContextMenu: (event: Event) => event.preventDefault(),
    },
    // The click after a hold does nothing
    wrapClick: (fn: () => void) => () => {
      if (held.current) {
        held.current = false;
        return;
      }
      fn();
    },
  };
};
