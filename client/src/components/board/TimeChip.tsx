import type { ReactNode } from 'react';

import { cn } from '@client/src/lib/utils';

interface TimeChipProps {
  label?: string;
  value: string;
  icon: ReactNode;
  tone?: 'light' | 'banner';
  className?: string;
}

const SHELL_CLASSES: Record<'light' | 'banner', string> = {
  light: 'rounded-[10px] border border-border bg-card px-4 py-2.5 shadow-sm',
  banner: 'rounded-full bg-card px-4 py-1.5 shadow-sm',
};

const TimeChip = ({
  label,
  value,
  icon,
  tone = 'light',
  className,
}: TimeChipProps) => {
  const isBanner = tone === 'banner';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 text-[14px] font-semibold text-foreground',
        SHELL_CLASSES[tone],
        className,
      )}
    >
      <span className={cn('shrink-0 text-primary', isBanner ? 'scale-110' : null)}>
        {icon}
      </span>
      {isBanner ? (
        <span className="flex flex-col leading-tight">
          {label ? (
            <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
          ) : null}
          <span className="tnum whitespace-nowrap font-bold">{value}</span>
        </span>
      ) : (
        <>
          {label ? (
            <span className="font-medium text-muted-foreground">{label}</span>
          ) : null}
          <span className="tnum whitespace-nowrap">{value}</span>
        </>
      )}
    </div>
  );
};

export default TimeChip;
