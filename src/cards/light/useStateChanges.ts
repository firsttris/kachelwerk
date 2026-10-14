import { useEffect, useRef, useState } from 'preact/hooks';

// From MUI's SwitchControl: counts how often the state changed, to restart
// the lamp's swing each time, and whether the last change came from
// elsewhere (the wall switch, an automation): anything but the state this
// tile just asked for.
export const useStateChanges = <T>(on: T) => {
  const [changes, setChanges] = useState(0);
  const [external, setExternal] = useState(false);
  const previous = useRef(on);
  const requested = useRef<{ state: T; at: number } | null>(null);
  useEffect(() => {
    if (previous.current === on) return;
    previous.current = on;
    setChanges((c) => c + 1);
    const own = requested.current && requested.current.state === on && Date.now() - requested.current.at < 3000;
    requested.current = null;
    if (!own) {
      setExternal(true);
      const timer = setTimeout(() => setExternal(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [on]);
  return {
    changes,
    external,
    markRequested: (state: T) => {
      requested.current = { state, at: Date.now() };
    },
  };
};
