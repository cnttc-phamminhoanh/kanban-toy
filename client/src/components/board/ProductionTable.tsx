import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { cn } from '@client/src/lib/utils';
import { useI18n } from '@client/src/i18n/I18nContext';
import type { TranslationKey } from '@client/src/i18n/dictionary';
import type { ProductionRecordRow } from '@shared/api.interface';

interface ProductionTableProps {
  rows: ProductionRecordRow[];
  showGoodsName?: boolean;
  showWoCode?: boolean;
  showItemCode?: boolean;
  showPoCode?: boolean;
}

type Tone = 'ok' | 'danger' | 'muted';

interface ColumnDef {
  key: string;
  label: string;
  align: 'left' | 'center';
  bodyLeft?: boolean;
  tinted?: boolean;
  render: (row: ProductionRecordRow) => string;
  tone?: (row: ProductionRecordRow) => Tone;
}

const EMPTY = '—';

const rateTone = (row: ProductionRecordRow): Tone => {
  if (row.completionRate === null) return 'muted';
  return row.completionRate >= 100 ? 'ok' : 'danger';
};

const diffTone = (row: ProductionRecordRow): Tone =>
  row.varianceQty >= 0 ? 'ok' : 'danger';

const hoursTone = (row: ProductionRecordRow): Tone => {
  if (row.varianceHours === null) return 'muted';
  return row.varianceHours >= 0 ? 'ok' : 'danger';
};

const num = (value: number | null, digits = 0): string =>
  value === null || Number.isNaN(value) ? EMPTY : value.toFixed(digits);

const buildColumns = (
  showGoodsName: boolean,
  showWoCode: boolean,
  showItemCode: boolean,
  showPoCode: boolean,
  t: (key: TranslationKey) => string,
): ColumnDef[] => {
  const columns: ColumnDef[] = [
    {
      key: 'groupName',
      label: t('colGroup'),
      align: 'center',
      render: (row) => row.groupName || EMPTY,
    },
    {
      key: 'workers',
      label: t('colWorkers'),
      align: 'center',
      render: (row) =>
        `${num(row.plannedWorkers)}/${num(row.actualWorkers)}`,
    },
    ...(showItemCode
      ? [
        {
          key: 'itemCode',
          label: t('colItemCode'),
          align: 'center' as const,
          render: (row: ProductionRecordRow) => row.itemCode || EMPTY,
        },
      ]
      : []),
    ...(showWoCode
      ? [
        {
          key: 'woCode',
          label: t('colWoCode'),
          align: 'center' as const,
          render: (row: ProductionRecordRow) => row.woCode ?? EMPTY,
        },
      ]
      : []),
    ...(showPoCode
      ? [
        {
          key: 'poCode',
          label: t('colPoCode'),
          align: 'center' as const,
          render: (row: ProductionRecordRow) => row.poCode || EMPTY,
        },
      ]
      : []),
    {
      key: 'poQty',
      label: t('colPoQty'),
      align: 'center',
      render: (row) => num(row.poQty),
    },
    {
      key: 'operationStaff',
      label: t('colOperation'),
      align: 'center',
      render: (row) => num(row.operationStaff),
    },
  ];

  if (showGoodsName) {
    columns.push({
      key: 'goodsName',
      label: t('colGoodsName'),
      align: 'center',
      bodyLeft: true,
      render: (row) => row.goodsName ?? EMPTY,
    });
  }

  columns.push(
    {
      key: 'smv',
      label: 'SMV',
      align: 'center',
      render: (row) =>
        Number.isFinite(row.smv) ? String(Number(row.smv.toFixed(3))) : EMPTY,
    },
    {
      key: 'plannedQty',
      label: t('colPlannedQty'),
      align: 'center',
      render: (row) => num(row.plannedQty),
    },
    {
      key: 'actualQty',
      label: t('colActualQty'),
      align: 'center',
      render: (row) => num(row.actualQty),
    },
    {
      key: 'completionRate',
      label: t('colCompletion'),
      align: 'center',
      tinted: true,
      render: (row) => (row.completionRate === null ? EMPTY : `${row.completionRate}%`),
      tone: rateTone,
    },
    {
      key: 'varianceQty',
      label: t('colVariance'),
      align: 'center',
      tinted: true,
      render: (row) => num(row.varianceQty),
      tone: diffTone,
    },
    {
      key: 'varianceHours',
      label: t('colFinishTime'),
      align: 'center',
      tinted: true,
      render: (row) => num(row.varianceHours, 3),
      tone: hoursTone,
    },
  );

  return columns;
};

const tintClass = (row: ProductionRecordRow): string =>
  row.actualQty > 0 && row.actualQty < row.plannedQty ? 'bg-status-danger-tint' : '';

const toneClass: Record<Tone, string> = {
  ok: 'text-status-ok',
  danger: 'text-status-danger',
  muted: 'text-muted-foreground',
};

const DEFAULT_WIDTHS: Record<string, number> = {
  groupName: 205,
  workers: 135,
  itemCode: 120,
  woCode: 170,
  goodsName: 180,
  poCode: 95,
  poQty: 65,
  operationStaff: 95,
  smv: 50,
  plannedQty: 65,
  actualQty: 65,
  completionRate: 110,
  varianceQty: 95,
  varianceHours: 135,
};

const isResizable = (key: string) => key === 'goodsName';
const WO_COLUMN_WIDTH = 'clamp(160px, 13vw, 320px)';

const FittedWoCode = ({ value }: { value: string }) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;
    const fit = () => {
      const availableWidth = container.clientWidth;
      if (availableWidth <= 0) return;
      let size = parseFloat(getComputedStyle(container).fontSize);
      text.style.fontSize = `${size}px`;
      // Measure each cell independently; short codes keep their original size.
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const width = text.getBoundingClientRect().width;
        if (width <= availableWidth || width === 0) break;
        size *= availableWidth / width;
        text.style.fontSize = `${size}px`;
      }
    };
    fit();
    let lastWidth = container.clientWidth;
    const observer = new ResizeObserver(() => {
      if (container.clientWidth === lastWidth) return;
      lastWidth = container.clientWidth;
      fit();
    });
    observer.observe(container);
    window.addEventListener('resize', fit);
    let active = true;
    void document.fonts.ready.then(() => { if (active) fit(); });
    return () => {
      active = false;
      observer.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, [value]);

  return (
    <span ref={containerRef} className="block whitespace-nowrap" title={value}>
      <span ref={textRef} className="inline-block">{value}</span>
    </span>
  );
};

const ProductionTable = ({
  rows,
  showGoodsName = false,
  showWoCode = false,
  showItemCode = true,
  showPoCode = true,
}: ProductionTableProps) => {
  const { t } = useI18n();
  const columns = buildColumns(showGoodsName, showWoCode, showItemCode, showPoCode, t);
  const groupedRows = useMemo(() => {
    const groups = new Map<string, ProductionRecordRow[]>();

    rows.forEach((row) => {
      const groupRows = groups.get(row.groupName) ?? [];
      groupRows.push(row);
      groups.set(row.groupName, groupRows);
    });

    return Array.from(groups.values()).flatMap((groupRows) =>
      [...groupRows]
        .sort((left, right) => right.varianceQty - left.varianceQty)
        .map((row, groupIndex) => ({
          row,
          groupRowSpan: groupIndex === 0 ? groupRows.length : 0,
        })),
    );
  }, [rows]);
  const [columnWidths, setColumnWidths] = useState<Record<string, number> | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [groupWidth, setGroupWidth] = useState(220);
  useLayoutEffect(() => {
    const measure = () => {
      const cell = tableRef.current?.querySelector('td');
      if (!cell) return;
      const context = document.createElement('canvas').getContext('2d');
      if (!context) return;
      const style = getComputedStyle(cell);
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const textWidth = Math.max(...rows.map((row) => context.measureText(row.groupName || EMPTY).width));
      setGroupWidth(Math.ceil(textWidth + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + 4));
    };
    measure();
    let active = true;
    void document.fonts.ready.then(() => { if (active) measure(); });
    const observer = new ResizeObserver(measure);
    const container = tableRef.current?.parentElement;
    if (container) observer.observe(container);
    return () => { active = false; observer.disconnect(); };
  }, [rows]);
  useLayoutEffect(() => {
    const container = tableRef.current?.parentElement;
    if (!container) return;
    const observer = new ResizeObserver(() => setColumnWidths(null));
    observer.observe(container);
    return () => observer.disconnect();
  }, []);
  const resize = useRef<{
    key: string;
    startX: number;
    startWidth: number;
    widths: Record<string, number>;
  } | null>(null);
  const getWidth = (key: string) => DEFAULT_WIDTHS[key] ?? 150;
  const totalWidth = columns.reduce((total, column) => total + getWidth(column.key), 0);

  const startResize = (event: PointerEvent<HTMLSpanElement>, key: string) => {
    event.preventDefault();
    const headers = event.currentTarget.closest('table')!.querySelectorAll('th');
    const widths: Record<string, number> = {};
    columns.forEach((column, index) => {
      widths[column.key] = headers[index].getBoundingClientRect().width;
    });
    resize.current = {
      key, startX: event.clientX, startWidth: widths[key], widths,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveResize = (event: PointerEvent<HTMLSpanElement>) => {
    const current = resize.current;
    if (!current) return;
    const width = Math.max(80, current.startWidth + event.clientX - current.startX);
    setColumnWidths({ ...current.widths, [current.key]: width });
  };

  const stopResize = () => { resize.current = null; };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table
          ref={tableRef}
          className="production-table w-full table-fixed border-collapse"
          style={columnWidths ? {
            width: columns.reduce((total, column) => total + (
              column.key === 'groupName' ? groupWidth : columnWidths[column.key] ?? getWidth(column.key)
            ), 0),
          } : undefined}
        >
          <colgroup>
            {columns.map((column) => (
              <col
                key={column.key}
                style={{
                  width: column.key === 'groupName'
                    ? groupWidth
                    : column.key === 'woCode'
                      ? WO_COLUMN_WIDTH
                      : columnWidths?.[column.key]
                      ?? `calc((100% - ${groupWidth}px${showWoCode ? ` - ${WO_COLUMN_WIDTH}` : ''}) * ${getWidth(column.key) / (totalWidth - getWidth('groupName') - (showWoCode ? getWidth('woCode') : 0))})`
                }}
              />
            ))}
          </colgroup>
          <thead>
            <tr className="board-table-head">
              {columns.map((column: ColumnDef) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'relative font-bold leading-snug text-white whitespace-normal',
                    column.align === 'left'
                      ? 'text-left'
                      : 'text-center',
                  )}
                >
                  <span className="block [overflow-wrap:anywhere]">{column.label}</span>
                  {isResizable(column.key) && (
                    <span
                      onPointerDown={(event) => startResize(event, column.key)}
                      onPointerMove={moveResize}
                      onPointerUp={stopResize}
                      onPointerCancel={stopResize}
                      onLostPointerCapture={stopResize}
                      className="absolute right-0 top-0 z-10 h-full w-2 touch-none cursor-col-resize select-none border-r-2 border-white/60 hover:bg-white/30"
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupedRows.map(({ row, groupRowSpan }, index: number) => (
              <tr
                key={row.id}
                className={cn(
                  'border-b border-border/50 transition-colors last:border-b-0 hover:bg-primary/[0.06]',
                  index % 2 === 1 ? 'bg-board-head-from/[0.12]' : 'bg-card',
                )}
              >
                {columns.map((column: ColumnDef) => column.key === 'groupName' && groupRowSpan === 0 ? null : (
                  <td
                    key={column.key}
                    rowSpan={column.key === 'groupName' ? groupRowSpan : undefined}
                    className={cn(
                      'align-top whitespace-nowrap',
                      column.align === 'left' || column.bodyLeft ? 'text-left' : 'text-center',
                      column.tinted
                        ? cn('font-bold tnum', tintClass(row))
                        : 'font-medium text-foreground tnum',
                      column.tone && row.completionRate !== 0
                        ? toneClass[column.tone(row)]
                        : '',
                      column.key === 'groupName'
                        ? 'align-middle border-r border-border bg-card font-bold text-card-foreground'
                        : '',
                    )}
                  >
                    {column.key === 'woCode' ? (
                      <FittedWoCode value={column.render(row)} />
                    ) : <span
                      className={column.key === 'groupName' ? 'block whitespace-nowrap' : 'block truncate'}
                      title={column.render(row)}
                    >
                      {column.render(row)}
                    </span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductionTable;
