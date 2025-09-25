import { MainLayout } from '@/components/layout'
import DepartmentBubble from './department'
import PositionBubble from './position'
import TeamBubble from './team'

export default function OrgChart() {
    return (
        <MainLayout>
            {/* Halftone background */}
            <div className="halftone z-1 absolute inset-0 size-full opacity-10" />
            <div className="z-2 relative m-auto flex min-h-screen w-full flex-col items-center justify-start gap-y-10 pb-16 pt-10 xl:min-h-[unset]">
                {/* Content Here: Only Doing some bubble tests for now! */}
                <p className="w-full text-center text-4xl font-bold text-white">
                    Organization{' '}
                    <span className="text-black-pearl-dark">Chart</span>
                </p>
                <div className="w-full overflow-auto bg-white">
                    <DepartmentBubble name="Engineering" />
                    <PositionBubble
                        title="Deputy Tech Director"
                        name="Joops"
                        leadership="Senior"
                    />
                    <PositionBubble
                        title="Website Eng. Team Lead"
                        committees={['Engineering Committee']}
                    />
                    <TeamBubble
                        name="Welcome Team"
                        description="Welcome team guarantees that all new members of 
						PV recieve a friendly face to guide them through the process 
						of joining the org. They help inform new members of how to 
						get started in the org and direct them to areas of interest 
						such as upcoming events, state teams, department teams, and 
						more."
                    />
                </div>
            </div>
        </MainLayout>
    )
}
