import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from '#/server/tasks/tasks.ts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Task } from './types/task.type'

export function useTaskQueries() {
  const queryClient = useQueryClient()

  const { data: tasksState = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => getTasks(),
  })

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: updateTask,
    // Optimistic update: atualiza a tela antes da resposta do servidor,
    // essencial para o drag-and-drop parecer instantâneo.
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])

      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        (old ?? []).map((task) =>
          task.id === variables.data.id
            ? ({ ...task, ...variables.data } as Task)
            : task,
        ),
      )

      return { previousTasks }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])

      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        (old ?? []).filter((task) => task.id !== variables.data.id),
      )

      return { previousTasks }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  return {
    tasksState,
    isLoading,
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
  }
}
