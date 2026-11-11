import type { LineDashboardFilter, ProductionLine } from '@shared/api.interface';

export const PRODUCTION_LINES: ProductionLine[] = [
  {
    id: 'a307a6b1-c76a-460f-a813-7ae5abbc2b2a',
    code: 'F11-FINISHING',
    name: 'F11 FINSHING',
    subtitle: 'Finshing Line',
    accent: 'blue',
    targetLabel: 'Kiểm hàng',
  },
  {
    id: '8881886b-637e-4d6f-9c50-fe6fe874ed9b',
    code: 'F11-INJMOLDING',
    name: 'F11 INJMOLDING',
    subtitle: 'Injection Molding Line',
    accent: 'green',
    targetLabel: 'Ép nhựa',
  },
  {
    id: 'a77b5c92-cfee-4592-a9c1-08ba1d3a50dc',
    code: 'ASSEMBLY',
    name: 'ASSEMBLY',
    subtitle: 'Assembly Line',
    accent: 'orange',
    targetLabel: 'Lắp ráp',
  },
];

export const findProductionLine = (code: string): ProductionLine | null =>
  PRODUCTION_LINES.find((line: ProductionLine) => line.code === code) ?? null;

// Backend flow names are independent of the FE line codes.
export const LINE_DASHBOARD_FILTERS: Record<string, LineDashboardFilter[]> = {
  'F11-FINISHING': [
    { flow: 'BUTTONING-GI-F1-01', stepNo: 540 },
    { flow: 'IRONING-GI-F1-01', stepNo: 560 },
  ],
  ASSEMBLY: [
    { flow: 'SOCK-GI-F4-G', stepNo: 53 },
  ],
};

export const getLineDashboardFilters = (code: string): LineDashboardFilter[] => {
  const filters = LINE_DASHBOARD_FILTERS[code];
  if (!filters?.length) {
    throw new Error(`Chưa cấu hình flow/stepNo cho chuyền ${code}.`);
  }
  return filters;
};
