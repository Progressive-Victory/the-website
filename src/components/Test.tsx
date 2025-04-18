import { ITest } from "@/models/Test"

const getEntries = async () => {
    const response = await fetch(process.env.URL + '/api/test')
    console.log(response)
    const data = await response.json()
    return data
}

export async function TestComp() {
    
    const data: ITest[] = await getEntries()

    return (
        <div>
            {data.map(entry => (
                <div key={entry.a}>
                    <a>{entry.a}</a>
                    <a>{entry.b}</a>
                    <a>{entry.c}</a>
                </div>
            ))}
        </div>
    )
}