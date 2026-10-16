import { useEffect, useRef } from 'preact/hooks';

// How fast the blades turn at a speed (0..1): turns per second, a slow
// drift at the lowest speed, a blur at full speed
const turnsAt = (spin: number) => (spin > 0 ? 0.35 + spin * 2.4 : 0);

// The blades of a fan turning: spinning up and coasting down as a real fan
// does, instead of jumping when the speed changes (a CSS animation would
// restart its turn). Written to the element's transform once a frame, and
// only while the blades move; still without motion (effects off, the
// system's reduced motion).
export const useSpin = <E extends SVGElement>(spin: number, reverse: boolean, moving: boolean) => {
  const ref = useRef<E>(null);
  const target = useRef(0);
  const state = useRef({ angle: 0, velocity: 0, frame: 0, last: 0 });
  const reduced =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.current = moving && !reduced ? turnsAt(spin) * (reverse ? -1 : 1) : 0;

  useEffect(() => {
    const s = state.current;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - s.last) / 1000);
      s.last = now;
      // About a second to spin up or coast down
      s.velocity += (target.current - s.velocity) * Math.min(1, dt * 2.2);
      if (target.current === 0 && Math.abs(s.velocity) < 0.02) s.velocity = 0;
      s.angle = (s.angle + s.velocity * 360 * dt) % 360;
      ref.current?.setAttribute('transform', `rotate(${s.angle.toFixed(2)} 32 32)`);
      s.frame = s.velocity === 0 && target.current === 0 ? 0 : requestAnimationFrame(tick);
    };
    if (!s.frame && (target.current !== 0 || s.velocity !== 0)) {
      s.last = performance.now();
      s.frame = requestAnimationFrame(tick);
    }
  });

  useEffect(
    () => () => {
      cancelAnimationFrame(state.current.frame);
      state.current.frame = 0;
    },
    [],
  );
  return ref;
};
