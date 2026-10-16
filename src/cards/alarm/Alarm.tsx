import { useEffect, useState } from 'preact/hooks';
import { Tile, type TileStatus } from '../../components/Tile';
import { rgba, useEffects } from '../../contexts/EffectsContext';
import { m } from '../../i18n/messages';
import { cn } from '../../lib/utils';
import { type Action, type AlarmView, type Mode, needsCode, toneOf, urgent } from './alarmModel';
import { Keypad } from './Keypad';
import { ModeBar } from './ModeBar';
import { actionText, stateText, TONE_ACTIVE, TONE_COLOR, TONE_TEXT } from './modes';
import { PanicButton } from './PanicButton';
import { Shield } from './Shield';

export interface AlarmProps {
  name: string;
  view: AlarmView;
  status?: TileStatus;
  // The code only when the panel asked for one
  onAction: (action: Action, code?: string) => void;
  onName?: () => void;
}

// An alarm panel: the shield in the state's color, the modes as segments,
// and the keypad only while a mode waits for its code
export const Alarm = ({ name, view, status, onAction, onName }: AlarmProps) => {
  const effects = useEffects();
  const { state, tone } = view;
  // The mode waiting for its code; closed: the pad was put away
  const [chosen, setChosen] = useState<Mode | 'closed' | null>(null);
  // The pad stays while the panel moves on (arming → armed while one types
  // the code to disarm); it goes once the panel is in the chosen mode, and
  // a put-away pad may come back by itself on the next state
  useEffect(() => setChosen((c) => (c === 'closed' || c === state ? null : c)), [state]);
  // Triggered or about to be: the pad to disarm is there right away
  const pending =
    chosen === 'closed' ? null : (chosen ?? (urgent(view) && needsCode(view, 'disarmed') ? 'disarmed' : null));
  const unavailable = !!status?.UNREACH;

  const pick = (mode: Mode) => {
    if (mode === view.active) return setChosen('closed');
    if (!needsCode(view, mode)) {
      setChosen('closed');
      return onAction(mode);
    }
    setChosen(pending === mode ? 'closed' : mode);
  };

  const alarm = tone === 'triggered';
  // The alarm by hand, not while it sounds
  const panic = view.canTrigger && !alarm;
  const color = TONE_COLOR[tone];
  return (
    <Tile
      status={status}
      role="group"
      aria-label={name}
      lit={alarm}
      className={cn(alarm && 'border-red-500/50', alarm && effects.on && 'fx-alarm')}
      style={
        effects.on && tone !== 'unknown' && tone !== 'disarmed'
          ? {
              background: `radial-gradient(80% 90% at 0% 0%, ${rgba(color, (alarm ? 0.2 : 0.09) * effects.k)}, transparent 70%), var(--card)`,
            }
          : undefined
      }
    >
      <div className="flex flex-col gap-3 p-3.5">
        {/* The shield beside the name; on a narrow card with the alarm
            button, the name goes under the shield and the button */}
        <div
          className={cn(
            'grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 [grid-template-areas:"pic_info_panic"]',
            panic && '@max-[259px]:grid-cols-[auto_minmax(0,1fr)] @max-[259px]:[grid-template-areas:"pic_panic"_"info_info"]',
          )}
        >
          <div className="[grid-area:pic]">
            <Shield state={state} tone={tone} />
          </div>
          <button type="button" onClick={onName} className="flex min-w-0 flex-col gap-0.5 text-left [grid-area:info]">
            <span className="line-clamp-2 text-[15px] leading-snug font-medium break-words" title={name}>
              {name}
            </span>
            <span role="status" className={cn('text-[13px] font-medium', TONE_TEXT[tone])}>
              {stateText(state)}
            </span>
            {view.changedBy && (
              <span className="truncate text-xs text-muted-foreground">{m.ALARM_CHANGED_BY({ name: view.changedBy })}</span>
            )}
          </button>
          {panic && (
            <div className="justify-self-end [grid-area:panic]">
              <PanicButton disabled={unavailable} onTrigger={() => onAction('trigger')} />
            </div>
          )}
        </div>

        <ModeBar
          modes={view.modes}
          active={view.active}
          chosen={pending}
          disabled={unavailable}
          onMode={pick}
        />

        {pending && view.codeFormat && !unavailable && (
          <Keypad
            // A fresh pad (and an empty code) for each mode
            key={pending}
            format={view.codeFormat}
            // Into the field after a tap, not when the pad opens by itself
            focus={chosen !== null}
            action={actionText(pending)}
            tone={TONE_ACTIVE[toneOf(pending)]}
            onCancel={() => setChosen('closed')}
            onSubmit={(code) => {
              setChosen('closed');
              onAction(pending, code);
            }}
          />
        )}
      </div>
    </Tile>
  );
};
