import { useOutsideDetector } from '@/util/hooks'
import { useEffect, useRef, useState } from 'react'

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

    useEffect(() => {
        if (!wrapperRef.current) return
        const closers = Array.from(
            wrapperRef.current.getElementsByClassName('closer')
        )

        setCloserList(closers)
    }, [open])

    useOutsideDetector(wrapperRef, setOpen)

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
