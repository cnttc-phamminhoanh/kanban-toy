import { useEffect, useMemo, useState, type RefObject } from 'react';

const BOTTOM_GAP_PX = 6;
const HEADER_FALLBACK_PX = 46;
const MAX_ROWS_PER_PAGE = 12;

export interface RowPaginationState {
  pages: number[][];
  pageCount: number;
  measuring: boolean;
}

const splitByHeight = (
  rowHeights: number[],
  availableHeight: number,
): number[][] => {
  const pages: number[][] = [];
  let current: number[] = [];
  let used = 0;

  rowHeights.forEach((height: number, index: number) => {
    if (current.length > 0 && (current.length >= MAX_ROWS_PER_PAGE || used + height > availableHeight)) {
      pages.push(current);
      current = [];
      used = 0;
    }
    current.push(index);
    used += height;
  });

  if (current.length > 0) pages.push(current);
  return pages;
};

export const useRowPagination = (
  containerRef: RefObject<HTMLElement | null>,
  rowCount: number,
  resetKey: string,
): RowPaginationState => {
  const [rowHeights, setRowHeights] = useState<number[]>([]);
  const [availableHeight, setAvailableHeight] = useState(0);
  const [measuring, setMeasuring] = useState(true);

  useEffect(() => {
    setRowHeights([]);
    setMeasuring(true);
  }, [rowCount, resetKey]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return undefined;

    let lastWidth = container.clientWidth;
    let lastHeight = container.clientHeight;
    const observer = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === lastWidth && height === lastHeight) return;
      lastWidth = width;
      lastHeight = height;
      setMeasuring(true);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef]);

  useEffect(() => {
    if (!measuring) return;
    const container = containerRef.current;
    if (!container) return;

    const rows: Element[] = Array.from(container.querySelectorAll('tbody tr'));
    if (rows.length !== rowCount) return;

    const headerEl = container.querySelector('thead tr');
    const headerHeight = headerEl
      ? headerEl.getBoundingClientRect().height
      : HEADER_FALLBACK_PX;
    const heights = rows.map((el: Element) => el.getBoundingClientRect().height);

    setAvailableHeight(
      Math.max(container.clientHeight - headerHeight - BOTTOM_GAP_PX, 0),
    );
    setRowHeights(heights);
    setMeasuring(false);
  }, [measuring, rowCount, containerRef]);

  const pages = useMemo(
    () =>
      rowHeights.length === rowCount
        ? splitByHeight(rowHeights, availableHeight)
        : [],
    [rowHeights, availableHeight, rowCount],
  );

  return { pages, pageCount: pages.length, measuring };
};
