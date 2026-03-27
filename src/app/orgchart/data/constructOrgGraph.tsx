//Name for file - constructGraph.tsx
import { CreateDepartmentNode } from '../components/department'
import { CreateEdge } from '../components/edge'
import { CreatePositionNode } from '../components/position'
import { CreateTeamNode } from '../components/team'
import { type Node, type Edge } from '@xyflow/react'

export const departments = [
    {
        depName: 'Community',
        teams: ['Welcome', 'Events', 'Moderation', 'Writing'],
    },
    { depName: 'Media', teams: ['Writing', 'Audio-Video', 'Design'] },
    { depName: 'Operations', teams: ['Fundraising', 'Documentation'] },
    { depName: 'Infrastructure', teams: ['Documentation', 'Research'] },
    {
        depName: 'Organizing',
        teams: ['Recruitment', 'Mobilization'],
        coalitions: ['Western', 'Midwest', 'Northwestern', 'Southern'],
    },
    { depName: 'Technology', teams: ['Discord', 'Database', 'Website'] },
]

export function BuildGraphNodes(inputNodes: Node[]) {
    const nodes: Node[] = []
    const edges: Edge[] = []

    const EXEC_DIR = 'Executive Director'
    const DEP_EXEC_DIR = 'Deputy Executive Director'

    const EXEC_DIR_ID = 0
    const DEP_EXEC_DIR_ID = 1

    let id = inputNodes.length

    const execDir = inputNodes.find((e) => e?.title === EXEC_DIR)
    const depExecDir = inputNodes.find((e) => e?.title === DEP_EXEC_DIR)

    nodes.push(CreatePositionNode(execDir))
    nodes.push(CreatePositionNode(depExecDir))

    let departmentId = 0
    let teamId = 0
    let edgeId = 0

    edges.push(CreateEdge(`e${edgeId}`, EXEC_DIR_ID, DEP_EXEC_DIR_ID))
    edgeId++

    departments.forEach((dep) => {
        const depLeads = inputNodes.filter(
            (d) => d.department == dep.depName && !d.team
        )
        departmentId = id++
        nodes.push(
            CreateDepartmentNode({
                id: departmentId,
                name: dep.depName,
                leads: depLeads,
            })
        )

        edges.push(CreateEdge(`e${edgeId}`, DEP_EXEC_DIR_ID, departmentId))
        edgeId++

        dep?.teams.forEach((team) => {
            const teamLeads = inputNodes.filter((t) => t.team === team)

            console.log('teamLeads')
            console.log(teamLeads)

            function shareTeamNode(teamName) {
                const sharedNode =
                    team === teamName
                        ? nodes.find((node) => node.data.name === teamName)
                        : null

                if (sharedNode) {
                    edges.push(CreateEdge(`e${edgeId}`, departmentId, teamId))
                    edgeId++
                }
                return sharedNode
            }

            const writingTeamNode = shareTeamNode('Writing')

            const docTeamNode = shareTeamNode('Documentation')

            if (writingTeamNode || docTeamNode) return

            teamId = id++

            nodes.push(
                CreateTeamNode({
                    id: teamId,
                    name: team,
                    desc: 'Description',
                    members: team === 'Moderation' ? teamLeads : null,
                    leads: team === 'Moderation' ? null : teamLeads,
                })
            )
            //initial edges

            edges.push(CreateEdge(`e${edgeId}`, departmentId, teamId))

            edgeId++
        })
    })

    console.log(nodes)

    return { initialNodes: nodes, initialEdges: edges }
}
