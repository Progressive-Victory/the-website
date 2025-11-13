class DateService {
    getAge(dateOfBirth: string) {
        const dob = new Date(dateOfBirth).getTime()
        const current = new Date().getTime()
        const delta = current - dob
        if (isNaN(delta) || delta < 0) return null
        return new Date(delta).getUTCFullYear() - 1970
    }
}

const dateService = new DateService()
export { dateService }
