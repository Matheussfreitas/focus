import type { Prisma } from '../../../generated/prisma/client'

export type Task = Prisma.TaskGetPayload<{
  include: {
    tag: true,  
  }
}>