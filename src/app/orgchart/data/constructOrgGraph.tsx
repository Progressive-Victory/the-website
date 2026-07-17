//Name for file - constructGraph.tsx
import {
    CreateDepartmentNode,
    DepartmentNodeData,
} from '../components/department'
import { CreateEdge } from '../components/edge'
import { CreatePositionNode, PositionData } from '../components/position'
import { CreateTeamNode, TeamNodeData } from '../components/team'
import Committee from '../types/committee'
import { users, positions, posHierarchy, userPositions } from './DummyNodes'
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
        teams: ['Recruitment', 'State Coalitions', 'Mobilization'],
        coalitions: ['Western', 'Midwest', 'Northeastern', 'Southern'],
    },
    { depName: 'Technology', teams: ['Discord', 'Database', 'Website'] },
]

export const Committees: Committee[] = [
    {
        id: 101,
        name: 'Community Team',
        desc: 'The community management team...',
        icon: '/images/cir.png',
        alt: 'C',
    },
    {
        id: 102,
        name: 'Media Team',
        desc: 'The media team...',
        icon: '/images/tri.png',
        alt: 'M',
    },
    {
        id: 103,
        name: 'Engineering Committee',
        desc: "PV's engineering teams...",
        icon: '/images/sqr.png',
        alt: 'E',
    },
    {
        id: 104,
        name: 'State Organizing Committee',
        desc: 'The state organizing committee...',
        icon: '/images/dia.png',
        alt: 'S',
    },
]

export type OrgchartObjectData = {
    id: number
    title: string
    name: string
    leadership?: string
    department?: string
    team?: string
    committees?: Committee[]
}

const sharedNodes = ['Writing', 'Documentation']

class TeamNodeManager {
    sharedTeamNodes = new Map<string, number>()

    registerSharedTeam(teamName, nodeId) {
        if (sharedNodes.find((e) => e === teamName))
            //find((e) => e?.title === EXEC_DIR)
            this.sharedTeamNodes.set(teamName, nodeId)
    }
    getSharedTeamId(teamName) {
        return this.sharedTeamNodes.get(teamName) ?? null
    }
}

class GraphBuilder {
    nodes: Node[]
    edges: Edge[]
    edgeId: number
    graphNodeId: number
    posId: number
    depId: number
    teamId: number

    teamNodeManager = new TeamNodeManager()

    constructor() {
        this.nodes = []
        this.edges = []
        this.edgeId = 0
        this.graphNodeId = 0
        this.posId = 0
        this.depId = 0
        this.teamId = 0
    }
    addNode(inputNode: Node) {
        this.posId = this.graphNodeId++

        this.nodes.push(inputNode)
    }
    addPosNode(inputNode: OrgchartObjectData) {
        this.posId = this.graphNodeId++

        const { title, name, leadership } = inputNode

        this.nodes.push(
            CreatePositionNode({
                id: this.posId,
                title,
                name,
                leadership,
            })
        )
    }
    addDepNode(inputNode: DepartmentNodeData) {
        this.depId = this.graphNodeId++
        const { name, leads } = inputNode

        this.nodes.push(
            CreateDepartmentNode({
                id: this.depId,
                name,
                leads,
            })
        )
    }
    addTeamNode(inputNode: TeamNodeData) {
        this.teamId = this.graphNodeId++
        const { name, desc, members, leads } = inputNode

        const sharedTeamId = this.teamNodeManager.getSharedTeamId(name)

        if (sharedNodes.find((e) => e === name) && !sharedTeamId) {
            this.teamNodeManager.registerSharedTeam(name, this.teamId)
        }

        if (sharedTeamId) this.teamId = sharedTeamId

        this.nodes.push(
            CreateTeamNode({
                id: this.teamId,
                name: name,
                desc: desc,
                members: members,
                leads: leads,
            })
        )
    }
    addEdge(source: number, target: number) {
        this.edges.push(CreateEdge(`e${this.edgeId}`, source, target))
        this.edgeId++
    }
}

const obj = {
    EXEC_DIR: 'Executive Director',
    EXEC_DIR_ID: 0,
    DEP_EXEC_DIR: 'Deputy Executive Director',
    DEP_EXEC_DIR_ID: 1,
}

export function BuildGraphNodes(inputNodes: OrgchartObjectData[]) {
    const graphBuilder = new GraphBuilder()

    const execDir = inputNodes.find((e) => e?.title === obj.EXEC_DIR)
    const depExecDir = inputNodes.find((e) => e?.title === obj.DEP_EXEC_DIR)

    graphBuilder.addPosNode(execDir) //addPosNode(execDir)
    graphBuilder.addPosNode(depExecDir) //addPosNode(depExecDir)

    graphBuilder.addEdge(obj.EXEC_DIR_ID, obj.DEP_EXEC_DIR_ID)

    departments.forEach((dep) => {
        const depLeads = inputNodes.filter(
            (d) => d.department == dep.depName && !d.team
        )
        graphBuilder.addDepNode({ name: dep.depName, leads: depLeads })

        graphBuilder.addEdge(obj.DEP_EXEC_DIR_ID, graphBuilder.depId)

        dep?.teams.forEach((team) => {
            if (team !== 'State Coalitions') {
                addStandardTeam(graphBuilder, inputNodes, team)
            } else {
                addCoalitionTeam(
                    graphBuilder,
                    inputNodes,
                    team,
                    dep?.coalitions
                )
            }
        })
    })

    return {
        initialNodes: graphBuilder.nodes,
        initialEdges: graphBuilder.edges,
    }
}

export function testNewGraphBuilder(inputNodes: OrgchartObjectData[]) {
    const graphBuilder = new GraphBuilder()

    const nodeStack: Array<OrgchartObjectData> = []

    nodeStack.push(...inputNodes)
    nodeStack.reverse()

    const groupNodeSet = new Set()

    while (nodeStack.length > 0) {
        const currentNode = nodeStack.pop()
        if (!currentNode) continue //What does this do?

        const { parentPosId } = currentNode

        addNewGraphNode(graphBuilder, parentPosId, groupNodeSet)
    }

    return {
        initialNodes: graphBuilder.nodes.filter((n) => n?.id != null),
        initialEdges: graphBuilder.edges,
    }
}

function addNewGraphNode(graphBuilder, parentPosId, groupNodeSet) {
    const position = positions.find((pos) => pos.id === parentPosId)

    const graphNodeId = graphBuilder.graphNodeId
    console.log(`graphNodeId: ${graphNodeId}`)

    let graphNodeIdCurrent
    let graphNodeIdNext

    /*
    if (position?.name?.includes('Department') || position?.name?.includes('Team')) {
        if (groupNodeSet.has(position?.name)) return

        const userNodes = findUserNodes(parentPosId)

        addNewGroup(graphBuilder, userNodes, groupName)

        graphBuilder.addEdge(graphNodeIdCurrent, graphNodeIdNext)

        groupNodeSet.add(position?.name)
    }
    */

    if (position?.name?.includes('Department')) {
        if (groupNodeSet.has(position?.name)) return

        const userNodes = findUserNodes(parentPosId)

        graphNodeIdCurrent = graphBuilder.graphNodeId

        graphBuilder.addDepNode({ name: position?.name, leads: userNodes }) //name: position?.name, leads: depLeads //How do I deal with this? Maybe use filter again?

        graphNodeIdNext = graphBuilder.depId

        graphBuilder.addEdge(graphNodeIdCurrent, graphNodeIdNext)

        groupNodeSet.add(position?.name)
    } else if (position?.name?.includes('Team')) {
        if (groupNodeSet.has(position?.name)) return

        const userNodes = findUserNodes(parentPosId)
        graphNodeIdCurrent = graphBuilder.depId

        //graphBuilder.addTeamNode({ name: position?.name, leads: userNodes }) //name: position?.name, leads: teamLeads

        addStandardTeamTest(graphBuilder, userNodes, position?.name)

        graphNodeIdNext = graphBuilder.teamId
        graphBuilder.addEdge(graphNodeIdCurrent, graphNodeIdNext)

        groupNodeSet.add(position?.name)
    } else {
        //console.log(`position.name: ${position?.name}`)
        const newPosNode = findUserNodes(parentPosId)

        if (newPosNode?.length <= 0) return

        graphNodeIdCurrent = graphBuilder.graphNodeId

        graphBuilder.addPosNode(newPosNode[0]) //.filter(pos => pos.id !== null)

        graphNodeIdNext = graphBuilder.graphNodeId

        graphBuilder.addEdge(graphNodeIdCurrent, graphNodeIdNext)
    }
}

/*
function addNewGroup(graphBuilder, userNodes, groupName){
    if(groupName?.includes('Department')){
        graphNodeIdCurrent = graphBuilder.graphNodeId
        graphBuilder.addDepNode({ name: position?.name, leads: userNodes })
    }else if(groupName?.includes('Team')){
        
    }
}
*/

function findUserNodes(parentPosId) {
    const posHierarchyArray = posHierarchy.filter(
        (pos) => pos.parentPosId === parentPosId
    )

    return posHierarchyArray
        .map((posHierarchy) => {
            const position = positions.find(
                (pos) => pos.id === posHierarchy.childPosId
            )

            const childName = position?.name

            if (
                childName?.includes('Team') ||
                childName?.includes('Department')
            )
                return null

            const userPos = userPositions.find(
                (usr) => usr.posId === position?.id
            )

            const userNode = users.find((usr) => usr.id === userPos?.userId)
            if (!userNode) return

            return {
                id: userNode?.id,
                name: userNode?.name,
                title: position?.name,
            } // may be undefined if no match
        })
        .filter(Boolean) // remove undefined results (optional)
}

function addStandardTeamTest(graphBuilder, userNodes, teamName) {
    graphBuilder.addTeamNode({
        name: teamName,
        desc: 'Description',
        members: teamName === 'ModerationTeam' ? userNodes : undefined,
        leads: teamName === 'ModerationTeam' ? undefined : userNodes,
    })

    graphBuilder.addEdge(graphBuilder.depId, graphBuilder.teamId)
}

function addStandardTeam(graphBuilder, inputNodes, team) {
    const teamLeads = inputNodes.filter((t) => t.team === team)

    graphBuilder.addTeamNode({
        name: team,
        desc: 'Description',
        members: team === 'Moderation' ? teamLeads : undefined,
        leads: team === 'Moderation' ? undefined : teamLeads,
    })

    graphBuilder.addEdge(graphBuilder.depId, graphBuilder.teamId)
}

function addCoalitionTeam(graphBuilder, inputNodes, team, coalitions) {
    graphBuilder.addTeamNode({
        name: team,
        desc: 'Description',
    })

    graphBuilder.addEdge(graphBuilder.depId, graphBuilder.teamId)

    const coalitionsTeam = graphBuilder.teamId

    coalitions.forEach((coalition) => {
        const coalitionLeads = inputNodes.filter(
            (t) => t.coalition === coalition
        )

        console.log(inputNodes)

        graphBuilder.addTeamNode({
            name: coalition,
            desc: 'Description',
            members: undefined,
            leads: coalitionLeads,
        })
        graphBuilder.addEdge(coalitionsTeam, graphBuilder.teamId)
    })
}
