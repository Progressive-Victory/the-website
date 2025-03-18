'use client'
import { MainLayout } from '@/components/MainLayout'
import { Map } from '@/components/Map'
import 'leaflet/dist/leaflet.css'

export default function About() {
    return (
        <MainLayout>
            <div className="h-96">
                <Map variant="heatmap" />
            </div>
        </MainLayout>
    )
}
