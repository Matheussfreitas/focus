import { queryOptions } from '@tanstack/react-query'
import { getAccount } from '#/server/account/account.ts'

export const accountQueryOptions = queryOptions({
  queryKey: ['account'],
  queryFn: () => getAccount(),
})
