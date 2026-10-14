import { cn } from '../lib/utils';

// MUI's shadcn switch (radix-ui Switch) without radix: a button with role
// switch, the same classes and the same look
export const Switch = ({
  checked,
  onCheckedChange,
  className,
  disabled,
  ...props
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    data-state={checked ? 'checked' : 'unchecked'}
    disabled={disabled}
    onClick={() => onCheckedChange(!checked)}
    className={cn(
      'peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
      checked ? 'bg-primary' : 'bg-muted-foreground/30',
      className,
    )}
    {...props}
  >
    <span
      className={cn(
        'pointer-events-none block size-4 rounded-full bg-background ring-0 transition-transform',
        checked ? 'translate-x-[calc(100%-2px)]' : 'translate-x-0',
      )}
    />
  </button>
);
