import { TaskStatus } from "#/generated/prisma/enums.ts";
import type { Task } from "./types/task.type";

export const tasks: Task[] = [
  {
    id: '1',
    title: 'Task 1',
    description: 'Description 1',
    tag: null,
    tagId: null,
    status: TaskStatus.TODO,
    dueDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Task 2',
    description: 'Description 2',
    tag: null,
    tagId: null,
    status: TaskStatus.IN_PROGRESS,
    dueDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Task 3',
    description: 'Description 3',
    tag: null,
    tagId: null,
    status: TaskStatus.DONE,
    dueDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]