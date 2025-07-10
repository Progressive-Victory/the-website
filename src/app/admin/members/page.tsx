'use client'

import PaginatedList from '@/components/admin/PaginatedList'
import { IUser } from '@/models/User'

export default function () {
    const handleElementSelect = (value: IUser) => {
        return
    }

    return (
        <div className="col-span-10 overflow-y-auto p-4">
            <PaginatedList<IUser>
                api_endpoint="/api/admin/user"
                on_element_selected={handleElementSelect}
                id_key="_id"
                display_key="name"
            />
        </div>
    )
}
