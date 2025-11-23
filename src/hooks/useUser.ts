import { IUser } from '@/models/User'
import { DependencyList, useEffect, useState } from 'react'

/**
 * Optional props
 * @param {DependencyList[]} dependencies - An array of dependencies passed into the useEffect.  If any of the given values change, "useUser" will reload.
 * @param {boolean} autoLoad - Default to `true`.  If true, loads on first render.
 */
interface DataProps {
    dependencies?: DependencyList[]
    autoLoad?: boolean
}

interface DataState {
    data: IUser | undefined
    loading: boolean
    error: string
    reload: () => void
}

export default function useUser(props?: DataProps): DataState {
    const [autoLoad, setAutoLoad] = useState<boolean>(props?.autoLoad ?? true)
    const [data, setData] = useState<IUser | undefined>(undefined)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    function reload() {
        setLoading(true)

        void fetch('/api/user')
            .then(async (response) => {
                const body: unknown = await response.json()
                setData(body as IUser)
            })
            .catch((err) => setError(err as string))

        setLoading(false)
    }

    useEffect(() => {
        if (!autoLoad) {
            setAutoLoad(true)
            return
        }

        reload()
    }, [autoLoad])

    return { data, loading, error, reload }
}

/**
 * Given a "User", checks throughout the user's roles to see if any contain the specified permission.
 * @param {IUser} user - `data` from the `useUser` hook
 * @param {string} permission - Name of the permission
 */
export function hasPermission(user: IUser, permission: string): boolean {
    return user.roles.some((r) =>
        r.permissions?.some((p) => p.name == permission)
    )
}
