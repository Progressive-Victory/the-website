import { FetchError } from '@/models'
import { useMutation } from '@tanstack/react-query'

type OptimisticMutationParams<P> = P extends undefined ? object : { params: P }

type OptimisticMutationVariables<Old, New, Params> = {
    currentValue: Old
    newValue: New
} & OptimisticMutationParams<Params>

interface UseOptimisticMutationProps<Old, New, Params> {
    mutationFn: (
        variables: OptimisticMutationVariables<Old, New, Params>
    ) => Promise<New>
    onChange: (
        value: Old | New,
        params: OptimisticMutationVariables<Old, New, Params>
    ) => void
    onSettled?: () => void
}

function useOptimisticMutation<Old, New, Params = undefined>({
    mutationFn,
    onChange,
    onSettled,
}: UseOptimisticMutationProps<Old, New, Params>) {
    return useMutation<
        New,
        FetchError,
        OptimisticMutationVariables<Old, New, Params>,
        Old
    >({
        mutationFn,
        onMutate: (variables) => {
            onChange(variables.newValue, variables)
            return variables.currentValue
        },
        onError: (error, variables) => {
            console.error(error)
            onChange(variables.currentValue, variables)
        },
        onSuccess: (data, variables) => {
            onChange(data, variables)
        },
        onSettled,
    })
}

export function useOptimisticUpdate<Type, Params = undefined>(
    props: UseOptimisticMutationProps<Type, Type, Params>
) {
    return useOptimisticMutation<Type, Type, Params>(props)
}

export function useOptimisticDelete<Type, Params = undefined>(
    props: UseOptimisticMutationProps<Type, void, Params>
) {
    return useOptimisticMutation<Type, void, Params>(props)
}
