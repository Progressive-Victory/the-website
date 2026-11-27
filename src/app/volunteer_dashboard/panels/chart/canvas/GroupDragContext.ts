'use client'

import type { GroupDragFeedback } from './useGroupDrag'
import { createContext } from 'react'

export const GroupDragContext = createContext<{
    feedback: GroupDragFeedback | null
    nameOf: (id: string) => string
}>({ feedback: null, nameOf: () => '' })
