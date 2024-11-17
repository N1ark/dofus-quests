<script lang="ts" module>
    const nodeSelectListeners: ((nodeId: string | null) => void)[] = []
    const subscribeToNodeSelect = (
        callback: (nodeId: string | null) => void
    ) => {
        nodeSelectListeners.push(callback)
    }
    export const selectNode = (nodeId: string | null, push: boolean = true) => {
        localStorage.setItem('selected-quest', nodeId ?? '')
        nodeSelectListeners.forEach((callback) => callback(nodeId))
        if (nodeId && push) pushWindowToFront('selected-quest')
    }
</script>

<script lang="ts">
    import { onMount } from 'svelte'

    import type { Data } from '../data'
    import { data, id, onlyPredecessors } from '../data'
    import GraphView from './GraphView.svelte'
    import QuestInfo from './QuestInfo.svelte'
    import Window, {
        pushWindowToFront,
        setWindowVisibility,
        subscribeToWindowVisibility,
    } from './Window.svelte'

    let node: Data['nodes'][number] | null = $state(null)
    let currData: Pick<Data, 'nodes' | 'edges'> = $state({
        nodes: [],
        edges: [],
    })
    let childElements: string[] = $state([])
    let targetNode = $state<string>()

    $effect(() => {
        subscribeToWindowVisibility('selected-quest', (visible) => {
            if (!visible) {
                selectNode(null)
            }
        })
        subscribeToNodeSelect((nodeId) => {
            const tempNode =
                nodeId && data.nodes.find(({ id }) => id === nodeId)
            if (!tempNode) {
                node = null
                currData = { nodes: [], edges: [] }
                setWindowVisibility('selected-quest', false)
                return
            }
            setWindowVisibility('selected-quest', true)
            node = tempNode
            currData = onlyPredecessors(data, node.id)
            const rawExtraEdges = data.edges.filter(
                ({ from }) => from === tempNode.id
            )
            const extraNodes = data.nodes
                .filter(({ id }) => rawExtraEdges.some(({ to }) => to === id))
                .filter(({ id }) => !currData.nodes.some((n) => n.id === id)) // remove predecessors
            const extraEdges = rawExtraEdges.filter(({ to }) =>
                extraNodes.some(({ id }) => id === to)
            )
            currData = {
                nodes: [...currData.nodes, ...extraNodes],
                edges: [...currData.edges, ...extraEdges],
            }
            childElements = [...extraNodes, ...extraEdges].map(id)
            targetNode = tempNode.id
        })
    })

    onMount(() => {
        const stored = localStorage.getItem('selected-quest') ?? null
        selectNode(stored, false)
    })
</script>

<Window
    id="selected-quest"
    name={{
        key: 'selected-' + (node?.type ?? 'quest'),
    }}
    nameSecondary={node
        ? {
              key: node.id,
              name: 'name',
          }
        : undefined}
>
    <div class="back">
        <GraphView
            data={currData}
            faded={childElements}
            outlined={targetNode ? [targetNode] : undefined}
        />
    </div>
    {#if node !== null}
        <div class="front">
            <QuestInfo {node} />
        </div>
    {/if}
</Window>

<style>
    .back {
        position: fixed;
        inset: 0;
        top: 20px;
        overflow: hidden;
    }
    .front {
        position: relative;
        z-index: 1;
        pointer-events: none;
    }

    :global(.selectedQuestView) {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
    }
</style>
