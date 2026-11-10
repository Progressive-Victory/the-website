import type {
    Position,
    Line,
    BranchPoint,
    GroupBounds,
} from '../domain/chart.types'
import type { FormState } from '@/components/common/forms'

export interface ChartEditorState {
    drafts: Record<number, FormState<Position>>
    lineDrafts: Line[] | null
    branchPointDrafts: BranchPoint[] | null
    deletedPositionIds: Set<number>
    isEditing: boolean
    editRevision: number
}

export type ChartEditorAction =
    | { type: 'editingChanged'; editing: boolean }
    | { type: 'positionChanged'; form: FormState<Position> }
    | { type: 'positionCreated'; position: Position }
    | { type: 'positionReplaced'; position: Position }
    | { type: 'positionsDeleted'; ids: number[] }
    | {
          type: 'positionMoved'
          position: Position
          coordinates: NonNullable<Position['coordinates']>
      }
    | {
          type: 'groupsResized'
          groups: { position: Position; bounds: GroupBounds }[]
      }
    | {
          type: 'selectionPasted'
          positions: Position[]
          lines: Line[]
          branchPoints: BranchPoint[]
      }
    | { type: 'linesReplaced'; lines: Line[] }
    | { type: 'lineAdded'; line: Line; savedLines: Line[] }
    | {
          type: 'branchPointChanged'
          point: BranchPoint
          savedBranchPoints: BranchPoint[]
      }
    | {
          type: 'linePointsMoved'
          coordinates: Record<string, { x: number; y: number }>
          savedLines: Line[]
          savedBranchPoints: BranchPoint[]
      }
    | { type: 'lineGraphChanged'; lines: Line[]; branchPoints: BranchPoint[] }
    | { type: 'saveSucceeded' }
    | { type: 'discard' }

export function createChartEditorState(): ChartEditorState {
    return {
        drafts: {},
        lineDrafts: null,
        branchPointDrafts: null,
        deletedPositionIds: new Set(),
        isEditing: false,
        editRevision: 0,
    }
}

function clearDrafts(state: ChartEditorState): ChartEditorState {
    return {
        ...state,
        drafts: {},
        lineDrafts: null,
        branchPointDrafts: null,
        deletedPositionIds: new Set(),
        isEditing: false,
        editRevision: state.editRevision + 1,
    }
}

export function chartEditorReducer(
    state: ChartEditorState,
    action: ChartEditorAction
): ChartEditorState {
    switch (action.type) {
        case 'editingChanged':
            return { ...state, isEditing: action.editing }
        case 'positionChanged': {
            const formState = action.form
            if (formState.mode === 'read') return state
            const draft = state.drafts[formState.form.id]
            if (
                draft?.form === formState.form &&
                draft?.invalid === formState.invalid
            )
                return state
            const coordinates =
                draft &&
                draft.form.parentGroupId === formState.form.parentGroupId
                    ? (draft.form.coordinates ?? formState.form.coordinates)
                    : formState.form.coordinates
            return {
                ...state,
                drafts: {
                    ...state.drafts,
                    [formState.form.id]: {
                        ...formState,
                        form: {
                            ...formState.form,
                            coordinates,
                            groupBounds:
                                draft?.form.groupBounds ??
                                formState.form.groupBounds,
                        },
                    },
                },
            }
        }
        case 'positionCreated':
            return {
                ...state,
                isEditing: true,
                drafts: {
                    ...state.drafts,
                    [action.position.id]: {
                        form: action.position,
                        mode: 'create',
                        dirty: false,
                        invalid: true,
                    },
                },
            }
        case 'positionReplaced': {
            const { position } = action
            return {
                ...state,
                drafts: {
                    ...state.drafts,
                    [position.id]: {
                        ...state.drafts[position.id],
                        form: position,
                        mode: position.id < 0 ? 'create' : 'edit',
                        invalid: state.drafts[position.id]?.invalid ?? false,
                    },
                },
            }
        }
        case 'positionMoved': {
            const { position, coordinates } = action
            return {
                ...state,
                drafts: {
                    ...state.drafts,
                    [position.id]: {
                        ...state.drafts[position.id],
                        form: {
                            ...(state.drafts[position.id]?.form ?? position),
                            coordinates,
                        },
                        mode: position.id < 0 ? 'create' : 'edit',
                        dirty: true,
                        invalid: state.drafts[position.id]?.invalid ?? false,
                    },
                },
            }
        }
        case 'groupsResized': {
            const drafts = { ...state.drafts }
            for (const { position, bounds } of action.groups) {
                const current = drafts[position.id]
                drafts[position.id] = {
                    ...current,
                    form: {
                        ...(current?.form ?? position),
                        groupBounds: bounds,
                    },
                    mode: position.id < 0 ? 'create' : 'edit',
                    dirty: true,
                    invalid: current?.invalid ?? false,
                }
            }
            return { ...state, drafts }
        }
        case 'positionsDeleted':
            return {
                ...state,
                deletedPositionIds: new Set([
                    ...state.deletedPositionIds,
                    ...action.ids,
                ]),
            }
        case 'selectionPasted':
            return {
                ...state,
                drafts: {
                    ...state.drafts,
                    ...Object.fromEntries(
                        action.positions.map((form) => [
                            form.id,
                            {
                                form,
                                mode: 'create',
                                dirty: true,
                                invalid: !form.name.trim(),
                            },
                        ])
                    ),
                },
                lineDrafts: action.lines,
                branchPointDrafts: action.branchPoints,
            }
        case 'linesReplaced':
            return { ...state, lineDrafts: action.lines }
        case 'lineAdded':
            return {
                ...state,
                lineDrafts: [
                    ...(state.lineDrafts ?? action.savedLines),
                    action.line,
                ],
            }
        case 'branchPointChanged':
            return {
                ...state,
                branchPointDrafts: (
                    state.branchPointDrafts ?? action.savedBranchPoints
                ).map((point) =>
                    point.id === action.point.id ? action.point : point
                ),
            }
        case 'linePointsMoved':
            return {
                ...state,
                lineDrafts: (state.lineDrafts ?? action.savedLines).map(
                    (line) => ({
                        ...line,
                        points: line.points.map((point) =>
                            point.kind === 'waypoint' &&
                            action.coordinates[point.id]
                                ? {
                                      ...point,
                                      coordinates: action.coordinates[point.id],
                                  }
                                : point
                        ),
                    })
                ),
                branchPointDrafts: (
                    state.branchPointDrafts ?? action.savedBranchPoints
                ).map((point) =>
                    action.coordinates[point.id]
                        ? {
                              ...point,
                              coordinates: action.coordinates[point.id],
                          }
                        : point
                ),
            }
        case 'lineGraphChanged':
            return {
                ...state,
                lineDrafts: action.lines,
                branchPointDrafts: action.branchPoints,
            }
        case 'saveSucceeded':
        case 'discard':
            return clearDrafts(state)
    }
}
