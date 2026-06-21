import { RefObject, useEffect, useRef, useState } from 'react'

/*
preliminary notes: component that generates a button which upon being clicked displays an 
intractable tool tip menu beneath it

If the user clicks outside the menu while it is open it will close.
If you want a button in the menu to close it when pressed:
    1. add the class name 'closer' to it
    2. at the end of the callback for 'onClick' add 'ev.target.dispatchEvent(new Event('closettm'))'
        and make sure you include the argument 'ev' in the callback parameters to passthrough the mouse event
*/
export function ToolTip({
    children,
    label,
    triggerClasses,
    containerClasses,
}: {
    children: React.ReactNode
    label: string
    triggerClasses: string
    containerClasses: string
}) {
    const [open, setOpen] = useState<boolean>(false)
    const [closerList, setCloserList] = useState<Element[]>([])
    const wrapperRef = useRef<HTMLDivElement>(null)

    function useOutsideDetector(ref: RefObject<HTMLDivElement | null>) {
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
        }, [ref])
    }

    useEffect(() => {
        if (!wrapperRef.current) return
        const closers = Array.from(
            wrapperRef.current.getElementsByClassName('closer')
        )

        setCloserList(closers)
    }, [open])

    // For code quality, an effect is wrapped in a function.
    // ESlint can't verify this function call as legal though, so we need to help it (pulling it out of the function passes cleanly)
    useOutsideDetector(wrapperRef) //eslint-disable-line react-hooks/refs

    closerList?.map((element: Element) => {
        if (element instanceof HTMLButtonElement) {
            const btn = element
            btn.addEventListener('closettm', () => {
                setOpen(false)
            })
        }
    })

    return (
        <>
            <button
                onClick={() => {
                    setOpen(!open)
                }}
                className={triggerClasses}
            >
                {label}
            </button>
            {open ? (
                <div
                    ref={wrapperRef}
                    className={'absolute right-0 ' + containerClasses}
                >
                    {children}
                </div>
            ) : (
                <></>
            )}
        </>
    )
}
