import { CalendarDays, Clock } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { ProductionRecordRow } from '@shared/api.interface';

import { getApiErrorMessage } from '@client/src/lib/api-error';
import { useProductionLineDetail } from '@client/src/hooks/use-production';
import { useNow } from '@client/src/hooks/use-now';
import { useRowPagination } from '@client/src/hooks/use-row-pagination';
import { Button } from '@client/src/components/ui/button';
import { Skeleton } from '@client/src/components/ui/skeleton';
import BoardBottomBar from '@client/src/components/board/BoardBottomBar';
import ProductionTable from '@client/src/components/board/ProductionTable';
import TimeChip from '@client/src/components/board/TimeChip';
import { useI18n } from '@client/src/i18n/I18nContext';
import {
  formatBoardStampWithWeekday,
  formatSyncStamp,
} from '@client/src/utils/datetime';

const AUTO_PAGE_INTERVAL_MS = 20_000;

const rowPriority = (row: ProductionRecordRow): number => {
  if (row.actualQty === 0) return 2;
  if (row.actualQty >= row.plannedQty) return 0;
  return 1;
};

const LineDetailPage = () => {
  const { lineCode = '' } = useParams<{ lineCode: string }>();
  const now = useNow();
  const { lang, t, targetLabelText } = useI18n();
  const [page, setPage] = useState(1);
  const tableRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleTextRef = useRef<HTMLSpanElement>(null);
  const { data, isLoading, isError, error, refetch } = useProductionLineDetail(lineCode);

  const rows = data?.rows ?? [];
  const visibleRows = useMemo(
    () =>
      [...rows].sort(
        (a: ProductionRecordRow, b: ProductionRecordRow) =>
          rowPriority(a) - rowPriority(b),
      ),
    [rows],
  );

  const resetKey = useMemo(
    () =>
      `${lineCode}|${lang}|${visibleRows
        .map((row: ProductionRecordRow) => row.id)
        .join(',')}`,
    [lineCode, lang, visibleRows],
  );
  const { pages, pageCount, measuring } = useRowPagination(
    tableRef,
    visibleRows.length,
    resetKey,
  );
  const safePageCount = Math.max(pageCount, 1);
  const currentPage = Math.min(page, safePageCount);
  const pageIndexes = pages[currentPage - 1] ?? [];
  const tableRows =
    measuring || pageIndexes.length === 0
      ? visibleRows
      : pageIndexes.map((index: number) => visibleRows[index]);

  useEffect(() => {
    setPage(1);
  }, [lineCode, lang]);

  useEffect(() => {
    if (pageCount <= 1) return undefined;
    const timer = window.setTimeout(() => {
      setPage((prev) => (prev >= pageCount ? 1 : prev + 1));
    }, AUTO_PAGE_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [currentPage, pageCount]);

  const lineName = data?.line.name ?? lineCode;
  const targetLabel = data?.line.targetLabel?.trim();
  const hasRows = (data?.rows.length ?? 0) > 0;
  const isInjmolding = (data?.line.code ?? lineCode).toUpperCase().includes('INJMOLDING');
  const showGoodsName = isInjmolding;
  const showWoCode = isInjmolding;
  const showItemCode = !isInjmolding;
  const showPoCode = !isInjmolding;
  useLayoutEffect(() => {
    const title = titleRef.current;
    const text = titleTextRef.current;
    if (!title || !text) return;
    const fitTitle = () => {
      const baseSize = Math.min(32, Math.max(14, window.innerWidth * 0.015));
      text.style.fontSize = `${baseSize}px`;
      const naturalWidth = text.getBoundingClientRect().width;
      if (naturalWidth > title.clientWidth) {
        text.style.fontSize = `${baseSize * title.clientWidth / naturalWidth}px`;
      }
    };
    fitTitle();
    const observer = new ResizeObserver(fitTitle);
    observer.observe(title);
    let active = true;
    void document.fonts.ready.then(() => { if (active) fitTitle(); });
    return () => {
      active = false;
      observer.disconnect();
      text.style.fontSize = '';
    };
  }, [lang, lineName, targetLabel]);
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <main className="line-detail-layout mx-auto flex min-h-0 w-full flex-1 flex-col">
        <header className="shrink-0 py-1">
          <h1 ref={titleRef} className="board-banner w-full min-w-0 rounded-xl px-3 py-3 text-center shadow-sm">
            <span ref={titleTextRef} className="inline-flex w-max items-center gap-x-[0.4em] whitespace-nowrap text-[clamp(14px,1.5vw,32px)]">
              <span className="font-display font-extrabold text-board-banner-accent">{lineName}</span>
              {targetLabel ? (
                <span className="font-display font-extrabold text-white">
                  {t('targetCompletion', { target: targetLabelText(targetLabel) })}
                </span>
              ) : null}
            </span>
          </h1>
        </header>

        <div className="production-table-viewport mt-2 min-h-0 flex-1 overflow-y-auto scrollbar-hide" ref={tableRef}>
          {isLoading ? (
            <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
              <Skeleton className="h-[46px] rounded-none bg-board-head-from/80" />
              {[0, 1, 2, 3].map((key: number) => (
                <div key={key} className="flex gap-3 border-b border-border/50 px-3 py-3 last:border-b-0">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : null}

          {isError ? (
            <div className="rounded-xl border border-status-danger/30 bg-white px-6 py-14 text-center">
              <p className="text-[15px] font-semibold text-foreground">{t('lineLoadError')}</p>
              <p className="mt-1.5 text-[13px] text-muted-foreground">
                {getApiErrorMessage(error, t('requestFailedHint'))}
              </p>
              <Button className="mt-4" variant="outline" onClick={() => void refetch()}>
                {t('retry')}
              </Button>
            </div>
          ) : null}

          {!isLoading && !isError && hasRows && data ? (
            <div className="rise">
              <ProductionTable
                rows={tableRows}
                showGoodsName={showGoodsName}
                showWoCode={showWoCode}
                showItemCode={showItemCode}
                showPoCode={showPoCode}
              />
            </div>
          ) : null}

          {!isLoading && !isError && !hasRows && data ? (
            <div className="rounded-xl border border-dashed border-border bg-white px-6 py-16 text-center">
              <p className="text-[15px] font-semibold text-foreground">{t('noRowsTitle')}</p>
              <p className="mt-1.5 text-[13px] text-muted-foreground">
                {t('noRowsDesc', { date: data.targetDate })}
              </p>
              <Button className="mt-4" variant="outline" onClick={() => void refetch()}>
                {t('refresh')}
              </Button>
            </div>
          ) : null}
        </div>
      </main>

      <BoardBottomBar
        page={visibleRows.length > 12 ? currentPage : undefined}
        pageCount={visibleRows.length > 12 ? safePageCount : undefined}
        onPageChange={setPage}
        clocks={<>
          <TimeChip
            label={t('syncTime')}
            value={data ? formatSyncStamp(data.syncedAt) : '--:--:--'}
            icon={<Clock className="size-4" />}
            className="board-footer-clock"
          />
          <TimeChip
            value={formatBoardStampWithWeekday(now, lang)}
            icon={<CalendarDays className="size-4" />}
            className="board-footer-clock"
          />
        </>}
      />
    </div>
  );
};

export default LineDetailPage;
