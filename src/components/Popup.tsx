import { useState, useEffect, useRef, RefObject } from "react"

function getWindowDimensions(){
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    }
}

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
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())
    const [popupMarginWidth, setPopupMarginWidth] = useState(0) 

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions())
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        if(!wrapperRef.current) return
        const closers = Array.from(
            wrapperRef.current.getElementsByClassName("closer")
        )

        setPopupMarginWidth(Math.round((windowDimensions.width - wrapperRef.current.clientWidth)/2))
        setCloserList(closers)
    }, [open, wrapperRef])

    closerList?.map((element : Element) => {
        if(element instanceof HTMLButtonElement) {
            const btn = element as HTMLButtonElement
            btn.addEventListener('closepm', () => (setOpen(false)))
        }
        if(element instanceof HTMLFormElement) {
            const form = element as HTMLFormElement
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
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center">
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