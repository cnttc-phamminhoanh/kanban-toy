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
  wrap?: boolean;
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
      align: 'left',
      render: (row) => row.groupName || EMPTY,
    },
    {
      key: 'plannedWorkers',
      label: t('colPlannedWorkers'),
      align: 'center',
      render: (row) => num(row.plannedWorkers),
    },
    {
      key: 'actualWorkers',
      label: t('colActualWorkers'),
      align: 'center',
      render: (row) => num(row.actualWorkers),
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
      wrap: true,
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
  row.actualQty === 0 || (row.actualQty > 0 && row.actualQty < row.plannedQty) ? 'bg-status-danger/10' : '';

const toneClass: Record<Tone, string> = {
  ok: 'text-status-ok',
  danger: 'text-status-danger',
  muted: 'text-muted-foreground',
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

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <div>
        <table className="w-full table-fixed border-collapse max-lg:block">
          <thead className="max-lg:hidden">
            <tr className="board-table-head">
              {columns.map((column: ColumnDef) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'px-2 py-2.5 text-[12px] font-bold leading-snug text-white [overflow-wrap:anywhere]',
                    column.align === 'left'
                      ? 'text-left'
                      : 'text-center',
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="max-lg:block">
            {rows.map((row: ProductionRecordRow, index: number) => (
              <tr
                key={row.id}
                className={cn(
                  'border-b border-border/50 transition-colors last:border-b-0 hover:bg-primary/[0.06] max-lg:grid max-lg:grid-cols-2',
                  index % 2 === 1 ? 'bg-board-head-from/[0.12]' : 'bg-white',
                )}
              >
                {columns.map((column: ColumnDef) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-2 py-2.5 text-[12.5px] align-top whitespace-normal [overflow-wrap:anywhere] max-lg:flex max-lg:min-w-0 max-lg:flex-col max-lg:gap-1 max-lg:border-b max-lg:border-border/50 max-lg:text-left',
                      column.wrap
                        ? 'text-[12px] leading-snug'
                        : '',
                      column.align === 'left' || column.bodyLeft ? 'lg:text-left' : 'lg:text-center',
                      column.tinted
                        ? cn('font-bold tnum', tintClass(row))
                        : 'font-medium text-foreground tnum',
                      column.tone && row.actualQty === 0
                        ? toneClass.danger
                        : column.tone && row.actualQty !== 0
                          ? toneClass[column.tone(row)]
                          : '',
                      column.key === 'groupName' ? 'font-bold' : '',
                      column.key === 'groupName' || column.key === 'goodsName'
                        ? 'max-lg:col-span-2'
                        : '',
                    )}
                  >
                    <span className="text-[11px] font-semibold text-muted-foreground lg:hidden">
                      {column.label}
                    </span>
                    <span>{column.render(row)}</span>
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
