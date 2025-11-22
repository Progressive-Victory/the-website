import ClientPage from './client'
import dbConnect from '@/util/libmongo'

export default async function Page() {
    await dbConnect()

    return <ClientPage />
}
