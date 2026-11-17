import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { getDashboardData } from '#/server/dashboard/dashboard.ts'
import type { DashboardRange } from '#/lib/dashboard.ts'

export const dashboardQueryOptions = (range: DashboardRange) =>
  queryOptions({
    queryKey: ['dashboard', range],
    queryFn: () => getDashboardData({ data: { range } }),
    // trocar o período mantém os números antigos na tela até os novos chegarem
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
