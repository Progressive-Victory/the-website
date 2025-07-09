'use client'
import { MainLayout } from "@/components/layout";
import { useEffect, useState } from "react";

export default function Test() {
  const [stateCount, setStateCount] = useState<{ [key: string]: number } | null>(null)

  useEffect(() => {
    const test = async () => {
      const res = await fetch('/api/map/count')
      setStateCount(await res.json())
    }
    test()
  }, [])

  return (
    <MainLayout>
      {stateCount ? Object.keys(stateCount).filter(x => isNaN(+x)).map(state => (
        <div key={state}>
          <span>{state}: </span>
          <span>{stateCount[state]}</span>
        </div>
      )) :
        <p>loading</p>
      }
    </MainLayout>
  )
}