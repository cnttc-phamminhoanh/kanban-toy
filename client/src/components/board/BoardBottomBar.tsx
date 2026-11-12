import { House } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import BoardPagination from '@client/src/components/board/BoardPagination';
import LanguageToggle from '@client/src/components/board/LanguageToggle';
import ThemeToggle from '@client/src/components/board/ThemeToggle';
import { useI18n } from '@client/src/i18n/I18nContext';

interface BoardBottomBarProps {
  page?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
  clocks?: ReactNode;
}

const BoardBottomBar = ({ page, pageCount, onPageChange, clocks }: BoardBottomBarProps) => {
  const { t } = useI18n();
  const showPagination =
    typeof page === 'number' &&
    typeof pageCount === 'number' &&
    pageCount > 0 &&
    Boolean(onPageChange);

  return (
    <div className="board-bottom-bar shrink-0 px-3 py-1">
      <div className="flex w-full flex-wrap items-center justify-end gap-2">
        {clocks ? <div className="mr-auto flex flex-wrap items-center gap-2">{clocks}</div> : null}
        {showPagination && onPageChange ? (
          <>
            <BoardPagination page={page} pageCount={pageCount} onChange={onPageChange} />
            <span aria-hidden className="h-8 w-px bg-border md:h-9" />
          </>
        ) : null}

        <ThemeToggle />
        <LanguageToggle />

        <Link
          to="/"
          aria-label={t('homeAria')}
          className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <House className="size-5" aria-hidden />
        </Link>
      </div>
    </div>
  );
};

export default BoardBottomBar;
