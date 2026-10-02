import { createTag, deleteTag, getTags, updateTag } from '#/server/tags/tags.ts'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

export const tagsQueryOptions = queryOptions({
  queryKey: ['tags'],
  queryFn: () => getTags(),
})

export function useTagQueries() {
  const queryClient = useQueryClient()

  const { data: tagsState = [], isLoading } = useQuery(tagsQueryOptions)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['tags'] })
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
  }

  const createTagMutation = useMutation({
    mutationFn: createTag,
    onSuccess: invalidate,
  })

  const updateTagMutation = useMutation({
    mutationFn: updateTag,
    onSuccess: invalidate,
  })

  const deleteTagMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: invalidate,
  })

  return {
    tagsState,
    isLoading,
    createTagMutation,
    updateTagMutation,
    deleteTagMutation,
  }
}
