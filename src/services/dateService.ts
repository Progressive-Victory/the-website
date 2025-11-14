class DateService {
    now() {
        return new Date()
    }

    isValid(date: string) {
        return !isNaN(new Date(date).getTime())
    }

    toISODateString(date: string) {
        return this.isValid(date)
            ? new Date(date).toISOString().split('T')[0]
            : null
    }

    getAge(dateOfBirth: string) {
        const dob = new Date(dateOfBirth)
        const current = this.now()

        if (!this.isValid(dateOfBirth) || dob > current) return null

        const base = current.getUTCFullYear() - dob.getUTCFullYear()
        const lessOne =
            current.getUTCMonth() < dob.getUTCMonth() ||
            (current.getUTCMonth() == dob.getUTCMonth() &&
                current.getUTCDate() < dob.getUTCDate())

        return base + (lessOne ? -1 : 0)
    }
}

const dateService = new DateService()
export { dateService }
