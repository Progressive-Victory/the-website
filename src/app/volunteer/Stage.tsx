interface StageProps {
    stageName: string
    currentStage: string
    children: React.ReactNode
}

/* 
Stage manages the state of a staged component. Breaks up node rendering for pages with multiple stages.
*/
export function Stage({ stageName, currentStage, children }: StageProps) {
    return <>{stageName === currentStage ? children : null}</>
}
