import { useQuery } from '@tanstack/react-query';

import {
  fetchDashboardDetail,
  fetchInjmoldingDetail,
  fetchAssemblyDetail,
} from '@client/src/api/production';
import type { ProductionLineDetail } from '@shared/api.interface';

const REFRESH_INTERVAL_MS = 180_000;
const KANBAN_STALE_TIME_MS = 15_000;

export const lineKanbanQueryKey = (code: string) => ['line-kanban', code] as const;

export const fetchKanbanDetail = async (
  code: string,
): Promise<ProductionLineDetail> => {
  switch (code) {
    case 'F11-FINISHING':
      return fetchDashboardDetail(code);

    case 'F11-INJMOLDING':
      return fetchInjmoldingDetail(code);

    case 'ASSEMBLY':
      return fetchAssemblyDetail(code);

    default:
      throw new Error(`Chưa cấu hình API cho chuyền ${code}.`);
  }
};

export const useProductionLineDetail = (code: string) => {
  return useQuery({
    queryKey: lineKanbanQueryKey(code),
    queryFn: () => fetchKanbanDetail(code),
    enabled: code.length > 0,
    staleTime: KANBAN_STALE_TIME_MS,
    refetchInterval: REFRESH_INTERVAL_MS,
  });
};
