import { useState, useEffect, useRef} from "react"

export function Popup({
    children,
    label,
    triggerClasses,
    containerClasses
}: {
    children: React.ReactNode,
    label: string,
    triggerClasses: string,
    containerClasses: string
}) {
    const [open, setOpen] = useState<boolean>(false)
    const [closerList, setCloserList] = useState<Element[]>([])
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if(!wrapperRef.current) return
        const closers = Array.from(
            wrapperRef.current.getElementsByClassName("closer")
        )

        setCloserList(closers)
    }, [open, wrapperRef])

    closerList?.map((element : Element) => {
        if(element instanceof HTMLButtonElement) {
            const btn = element
            btn.addEventListener('closepm', () => (setOpen(false)))
        }
        if(element instanceof HTMLFormElement) {
            const form = element
            form.addEventListener('closepm', () => (setOpen(false)))
        }
    })

    return (
        <>
            <button
                onClick={() => (setOpen(!open))}
                className={triggerClasses}
            >
                {label}
            </button>
            {open ? 
                <div className="fixed left-0 top-0 flex size-full items-center justify-center">
                    <div 
                        ref={wrapperRef} 
                        className={containerClasses}
                        >
                        {children}
                    </div>
                </div>
            : 
                <></>
            }
        </>
    )
}