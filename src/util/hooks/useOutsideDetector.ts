import { RefObject, useEffect } from 'react'

export function useOutsideDetector(
    ref: RefObject<HTMLDivElement | null>,
    setOpen: (open: boolean) => void
) {
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                ref.current &&
                !ref.current.contains(event.target as HTMLElement)
            ) {
                setOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [ref, setOpen])
}
