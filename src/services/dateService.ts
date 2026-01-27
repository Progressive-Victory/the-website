class DateService {
    now() {
        return new Date()
    }

    isValid(date: Date | string | null | undefined) {
        return date && !isNaN(new Date(date).valueOf())
    }

    toISODateString(date: Date | string | null | undefined) {
        return this.isValid(date)
            ? new Date(date!).toISOString().split('T')[0]
            : null
    }

    formatDate(date: Date) {
        date = typeof date !== typeof Date ? new Date(date) : date
        return `${date.getUTCMonth()}/${date.getUTCDate()}/${date.getFullYear()} ${date.getUTCHours() === 0 ? 12 : date.getUTCHours() % 12}:${date.getUTCMinutes()} ${date.getUTCHours() > 12 ? 'PM' : 'AM'}`
    }

    getAge(dateOfBirth: Date) {
        const current = this.now()

        if (dateOfBirth > current) return null

        const base = current.getUTCFullYear() - dateOfBirth.getUTCFullYear()
        const lessOne =
            current.getUTCMonth() < dateOfBirth.getUTCMonth() ||
            (current.getUTCMonth() == dateOfBirth.getUTCMonth() &&
                current.getUTCDate() < dateOfBirth.getUTCDate())

        return base + (lessOne ? -1 : 0)
    }
}

const dateService = new DateService()
export { dateService }
