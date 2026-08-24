const PANEL_HISTORY_STORAGE_KEY = 'pv.admin.panel.history'

export function readPanelHistory(): string[] {
    if (typeof window === 'undefined') {
        return []
    }

    const rawHistory = window.sessionStorage.getItem(PANEL_HISTORY_STORAGE_KEY)
    if (!rawHistory) {
        return []
    }

    try {
        const parsed: unknown = JSON.parse(rawHistory)
        return Array.isArray(parsed)
            ? parsed.filter(
                  (value): value is string => typeof value === 'string'
              )
            : []
    } catch {
        return []
    }
}

export function writePanelHistory(history: string[]): void {
    if (typeof window === 'undefined') {
        return
    }

    window.sessionStorage.setItem(
        PANEL_HISTORY_STORAGE_KEY,
        JSON.stringify(history.slice(-50))
    )
}

export function clearPanelHistory(): void {
    if (typeof window === 'undefined') {
        return
    }

    window.sessionStorage.removeItem(PANEL_HISTORY_STORAGE_KEY)
}
