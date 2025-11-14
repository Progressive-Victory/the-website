class DateService {
    now() {
        return new Date()
    }

    getAge(dateOfBirth: string) {
        const dob = new Date(dateOfBirth).getTime()
        const current = this.now().getTime()
        const delta = current - dob
        if (isNaN(delta) || delta < 0) return null
        return new Date(delta).getFullYear() - 1970
    }
}

const dateService = new DateService()
export { dateService }
