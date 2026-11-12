import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { cn } from '@client/src/lib/utils';
import { useI18n } from '@client/src/i18n/I18nContext';

interface BoardPaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}

type PageItem = number | 'gap-left' | 'gap-right';

const buildPageItems = (page: number, pageCount: number): PageItem[] => {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_unused: unknown, index: number) => index + 1);
  }
  const items: PageItem[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  if (start > 2) items.push('gap-left');
  for (let index = start; index <= end; index += 1) items.push(index);
  if (end < pageCount - 1) items.push('gap-right');
  items.push(pageCount);
  return items;
};

const navButtonClass =
  'flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40';

const BoardPagination = ({ page, pageCount, onChange }: BoardPaginationProps) => {
  const { t } = useI18n();
  const items = buildPageItems(page, pageCount);
  const canPrev = page > 1;
  const canNext = page < pageCount;

  return (
    <nav
      aria-label={t('paginationAria')}
      className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm"
    >
      <span className="sr-only">{t('pageLabel', { page, total: pageCount })}</span>
      <button
        type="button"
        aria-label={t('firstPage')}
        className={cn(navButtonClass, 'hidden sm:flex')}
        disabled={!canPrev}
        onClick={() => onChange(1)}
      >
        <ChevronsLeft className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        aria-label={t('prevPage')}
        className={navButtonClass}
        disabled={!canPrev}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft className="size-4" aria-hidden />
      </button>

      <span className="tnum px-2 text-[13px] font-semibold text-foreground sm:hidden">
        {page}/{pageCount}
      </span>

      <span className="hidden items-center gap-1 sm:flex">
        {items.map((item) =>
          typeof item === 'number' ? (
            <button
              key={item}
              type="button"
              aria-label={t('pageLabel', { page: item, total: pageCount })}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onChange(item)}
              className={cn(
                'tnum flex size-8 items-center justify-center rounded-full text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                item === page
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-foreground hover:bg-primary/10 hover:text-primary',
              )}
            >
              {item}
            </button>
          ) : (
            <span
              key={item}
              aria-hidden
              className="flex size-6 items-center justify-center text-[13px] text-muted-foreground"
            >
              …
            </span>
          ),
        )}
      </span>

      <button
        type="button"
        aria-label={t('nextPage')}
        className={navButtonClass}
        disabled={!canNext}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        aria-label={t('lastPage')}
        className={cn(navButtonClass, 'hidden sm:flex')}
        disabled={!canNext}
        onClick={() => onChange(pageCount)}
      >
        <ChevronsRight className="size-4" aria-hidden />
      </button>
    </nav>
  );
};

export default BoardPagination;
