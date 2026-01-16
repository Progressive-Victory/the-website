export type ActionProps =
    | { buttonFunction: 'link'; href: string }
    | { buttonFunction: 'alert'; alertMessage?: string }
    | { buttonFunction: 'custom'; onClick: () => void }

export function runAction(action: ActionProps, label: string) {
    switch (action.buttonFunction) {
        case 'custom':
            action.onClick()
            return
        case 'link':
            window.location.href = action.href
            return
        case 'alert':
            alert(action.alertMessage ?? `You clicked "${label}"`)
            return
    }
}
