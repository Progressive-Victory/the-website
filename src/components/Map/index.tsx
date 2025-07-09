'use client'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./Map.client'), { ssr: false })
const StateMap = dynamic(() => import('./StateMap'), { ssr: false })

export {
  Map,
  StateMap
}