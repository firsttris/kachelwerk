import { type ComponentChildren, createContext } from 'preact';
import { useContext } from 'preact/hooks';

// How much glow and motion a tile shows, as MUI's effects menu. In HA it is
// set per card (effects: in the YAML): a wall tablet may want less.
export type EffectsLevel = 'off' | 'subtle' | 'strong';

interface EffectsContextType {
  level: EffectsLevel;
  // Factor for glow strength: 0 (off), 1 (subtle), 1.8 (strong)
  k: number;
  // Whether animations and glows are shown at all
  on: boolean;
}

const factors: Record<EffectsLevel, number> = { off: 0, subtle: 1, strong: 1.8 };

const EffectsContext = createContext<EffectsContextType>({ level: 'subtle', k: 1, on: true });

export const useEffects = () => useContext(EffectsContext);

export const EffectsProvider = ({ level, children }: { level: EffectsLevel; children: ComponentChildren }) => {
  const k = factors[level] ?? 1;
  return <EffectsContext.Provider value={{ level, k, on: k > 0 }}>{children}</EffectsContext.Provider>;
};

// "#rrggbb" with an alpha as rgba()
export const rgba = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
};
