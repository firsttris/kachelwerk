import { useState } from 'preact/hooks';
import CheckIcon from '~icons/lucide/check';
import DeleteIcon from '~icons/lucide/delete';
import XIcon from '~icons/lucide/x';
import { m } from '../../i18n/messages';
import { cn } from '../../lib/utils';
import type { CodeFormat } from './alarmModel';

// Long enough for any PIN; a keypad of the panel itself takes 4 to 8
const MAX_DIGITS = 12;

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

interface KeypadProps {
  format: CodeFormat;
  // What the code is for, e.g. "Arm away"
  action: string;
  // Tailwind classes of the confirm key
  tone: string;
  onSubmit: (code: string) => void;
  onCancel: () => void;
  // Focus the text field when it opens
  focus?: boolean;
}

const key =
  'press flex h-11 items-center justify-center rounded-xl bg-muted text-lg font-medium tabular-nums hover:bg-accent disabled:opacity-40 [&_svg]:size-5';

// The code, typed on a number pad (code_format number) or into a password
// field (text). It stays in here: shown as dots, never logged, gone when
// the pad closes.
export const Keypad = ({ format, action, tone, onSubmit, onCancel, focus }: KeypadProps) => {
  const [code, setCode] = useState('');
  const submit = () => {
    if (code === '') return;
    onSubmit(code);
    setCode('');
  };
  const type = (digit: string) => setCode((c) => (c.length < MAX_DIGITS ? c + digit : c));

  const header = (
    <div className="flex items-center justify-between gap-2">
      <span className="min-w-0 truncate text-[13px] text-muted-foreground">{m.ALARM_CODE_FOR({ action })}</span>
      {/* 20 px to see, 44 px to hit */}
      <button
        type="button"
        onClick={onCancel}
        aria-label={m.ALARM_CANCEL()}
        title={m.ALARM_CANCEL()}
        className="relative flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground after:absolute after:-inset-3 after:content-[''] hover:text-foreground [&_svg]:size-4"
      >
        <XIcon />
      </button>
    </div>
  );

  if (format === 'text') {
    return (
      <form
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        {header}
        <div className="flex gap-2">
          <input
            type="password"
            autoComplete="off"
            aria-label={m.ALARM_CODE()}
            placeholder={m.ALARM_CODE()}
            value={code}
            onInput={(event) => setCode(event.currentTarget.value)}
            // biome-ignore lint/a11y/noAutofocus: the field is opened by a tap to type into it
            autoFocus={focus}
            className="h-11 min-w-0 flex-1 rounded-xl border bg-background/60 px-3 text-[15px] outline-none focus:border-ring"
          />
          <button
            type="submit"
            disabled={code === ''}
            aria-label={m.ALARM_CONFIRM()}
            title={m.ALARM_CONFIRM()}
            className={cn(key, 'w-11 shrink-0', tone)}
          >
            <CheckIcon />
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      className="flex flex-col gap-2"
      // A keyboard works too, where there is one
      onKeyDown={(event) => {
        if (/^[0-9]$/.test(event.key)) type(event.key);
        else if (event.key === 'Backspace') setCode((c) => c.slice(0, -1));
        else if (event.key === 'Enter') submit();
        else return;
        event.preventDefault();
      }}
    >
      {header}
      {/* The code as dots, as many as typed */}
      <div
        role="status"
        aria-label={m.ALARM_CODE_ENTERED({ count: code.length })}
        className="flex h-5 items-center justify-center gap-2"
      >
        {code === '' ? (
          <span className="text-xs text-muted-foreground">{m.ALARM_CODE()}</span>
        ) : (
          Array.from(code, (_, i) => <span key={i} className="size-2.5 rounded-full bg-foreground" />)
        )}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {KEYS.map((digit) => (
          <button key={digit} type="button" onClick={() => type(digit)} className={key}>
            {digit}
          </button>
        ))}
        <button
          type="button"
          disabled={code === ''}
          onClick={() => setCode((c) => c.slice(0, -1))}
          aria-label={m.ALARM_DELETE()}
          title={m.ALARM_DELETE()}
          className={cn(key, 'bg-transparent text-muted-foreground')}
        >
          <DeleteIcon />
        </button>
        <button type="button" onClick={() => type('0')} className={key}>
          0
        </button>
        <button
          type="button"
          disabled={code === ''}
          onClick={submit}
          aria-label={m.ALARM_CONFIRM()}
          title={m.ALARM_CONFIRM()}
          className={cn(key, tone)}
        >
          <CheckIcon />
        </button>
      </div>
    </div>
  );
};
