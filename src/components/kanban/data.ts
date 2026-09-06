import { TaskStatus } from "#/generated/prisma/enums.ts";
import type { Task } from "./types/task.type";

export const tasks: Task[] = [
  {
    id: '1',
    title: 'Implementar MinIO',
    description: 'Description 1',
    tag: {
      id: '1',
      name: 'trabalho',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    tagId: null,
    status: TaskStatus.TODO,
    dueDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Estudar cloud',
    description: 'Description 2',
    tag: {
      id: '2',
      name: 'estudo',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    tagId: null,
    status: TaskStatus.IN_PROGRESS,
    dueDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Escrever artigo sobre cloud',
    description: 'Description 3',
    tag: {
      id: '3',
      name: 'pessoal',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    tagId: null,
    status: TaskStatus.DONE,
    dueDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]