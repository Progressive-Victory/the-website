import { TestComp } from "@/components/Test"
import ProtectedPage from "@/components/ProtectedPage"

export default function Test(){

    return (
        <ProtectedPage requiredRoles={ ["Superadmin"] }>
            <TestComp/>
        </ProtectedPage>
    )
}