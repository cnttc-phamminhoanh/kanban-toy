import { ChevronRight, Loader2 } from 'lucide-react';

import { cn } from '@client/src/lib/utils';
import { Image } from '@client/src/components/ui/image';
import { LINE_ACCENT_STYLES } from '@client/src/components/board/line-accent';
import type { ProductionLine } from '@shared/api.interface';

interface LineCardProps {
  line: ProductionLine;
  onOpen: (line: ProductionLine) => void;
  isOpening: boolean;
}

const LineCard = ({ line, onOpen, isOpening }: LineCardProps) => {
  const accent = LINE_ACCENT_STYLES[line.accent];
  const Icon = accent.icon;

  return (
    <button
      type="button"
      onClick={() => onOpen(line)}
      disabled={isOpening}
      aria-busy={isOpening}
      className={cn(
        'group relative flex w-full items-center gap-5 overflow-hidden rounded-xl border border-border bg-card p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-wait disabled:hover:translate-y-0',
        accent.border,
      )}
    >
      <span className={cn('absolute inset-y-0 left-0 w-[5px]', accent.bar)} aria-hidden />
      <span className="line-card-sheen pointer-events-none absolute inset-0" aria-hidden />

      <span
        className={cn(
          'relative flex size-16 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
          accent.tile,
        )}
      >
        {accent.imageSrc ? (
          <Image
            src={accent.imageSrc}
            alt=""
            width={34}
            height={34}
            aria-hidden
            className="relative size-9 object-contain"
          />
        ) : Icon ? (
          <Icon className={cn('size-6', accent.text)} aria-hidden />
        ) : null}
      </span>

      <span className="relative min-w-0 flex-1">
        <span className="block truncate text-[19px] font-extrabold uppercase leading-tight tracking-tight text-foreground md:text-[21px]">
          {line.name}
        </span>
        <span className="mt-1 block truncate text-[14px] font-medium text-muted-foreground md:text-[15px]">
          {line.subtitle}
        </span>
      </span>

      {isOpening ? (
        <Loader2
          className={cn('relative size-6 shrink-0 animate-spin', accent.text)}
          aria-hidden
        />
      ) : (
        <ChevronRight
          className={cn(
            'relative size-7 shrink-0 transition-transform duration-200 group-hover:translate-x-1',
            accent.text,
          )}
          aria-hidden
        />
      )}
    </button>
  );
};

export default LineCard;
