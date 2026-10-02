import type { TaskStatus } from '#/generated/prisma/enums.ts'

export type Column = {
  id: TaskStatus
  title: string
}
