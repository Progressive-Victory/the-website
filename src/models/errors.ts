export interface ApiError {
    error: string
    message: string
}

export class FetchError extends Error {
    status: number

    constructor(message: string, status: number, cause?: string | Error) {
        super(message, { cause })
        this.status = status
    }
}
