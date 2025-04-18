'use client'
import { ITest } from '@/models/Test'
import { useState } from 'react'
import { useEffect } from 'react'

export function TestComp() {
    const [data, setData] = useState<ITest[]>()

    useEffect(() => {
        const getEntries = async () => {
            const response = await fetch('/api/test')
            console.log(response)
            const data = await response.json()
            setData(data)
        }
        getEntries()
    }, [])

    return (
        <div>
            {data &&
                data.map((entry) => (
                    <div key={entry.a}>
                        <a>{entry.a}</a>
                        <a>{entry.b}</a>
                        <a>{entry.c}</a>
                    </div>
                ))}
        </div>
    )
}
