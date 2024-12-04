<script lang="ts" module>
    const nodeSelectListeners: ((nodeId: string | null) => void)[] = []
    const subscribeToNodeSelect = (
        callback: (nodeId: string | null) => void
    ) => {
        nodeSelectListeners.push(callback)
        return () => {
            const index = nodeSelectListeners.indexOf(callback)
            if (index !== -1) nodeSelectListeners.splice(index, 1)
        }
    }
    export const selectNode = (nodeId: string | null, push: boolean = true) => {
        localStorage.setItem('selected-quest', nodeId ?? '')
        nodeSelectListeners.forEach((callback) => callback(nodeId))
        if (nodeId && push) pushWindowToFront('selected-quest')
    }
</script>

<script lang="ts">
    import Check from 'lucide-svelte/icons/check'
    import CheckList from 'lucide-svelte/icons/list-checks'
    import ListX from 'lucide-svelte/icons/list-x'
    import X from 'lucide-svelte/icons/x'

    import DofusDB from '../images/dofusdb.png'
    import DofusPourLesNoobs from '../images/dofusprlesnoobs.png'

    import { onMount, untrack } from 'svelte'
    import Button from '../components/Button.svelte'
    import GraphViewWrapper from '../components/GraphViewWrapper.svelte'
    import QuestInfo from '../components/QuestInfo.svelte'
    import Window, {
        pushWindowToFront,
        setWindowVisibility,
        subscribeToWindowVisibility,
    } from '../components/Window.svelte'
    import { data, id, onlyPredecessors, type Data } from '../data/data'
    import { completed } from '../data/state.svelte'

    let node: Data['nodes'][number] | null = $state(null)
    let currData: Pick<Data, 'nodes' | 'edges'> = $state({
        nodes: [],
        edges: [],
    })
    let childElements: string[] = $state([])
    let targetNode = $state<string>()
    let ownCompleted = $state(new Set<string>())
    let isCompleted = $derived(targetNode && ownCompleted.has(targetNode))

    completed.subscribe(({ completed }) => {
        ownCompleted = new Set(completed)
    })

    subscribeToWindowVisibility('selected-quest', (visible) => {
        if (!visible) {
            selectNode(null)
        }
    })

    onMount(() =>
        untrack(() => {
            const destroy = subscribeToNodeSelect((nodeId) => {
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
                    .filter(({ id }) =>
                        rawExtraEdges.some(({ to }) => to === id)
                    )
                    .filter(
                        ({ id }) => !currData.nodes.some((n) => n.id === id)
                    ) // remove predecessors
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

            const stored = localStorage.getItem('selected-quest') ?? null
            selectNode(stored, false)

            return destroy
        })
    )

    const handleMarkCompleted = (id: string, parents: boolean) => () => {
        const nodes: string[] = parents
            ? currData.nodes
                  .map((n) => n.id)
                  .filter((n) => !childElements.includes(n))
            : [id]
        completed.update((data) => {
            const toCompleted = !data.completed.includes(id)
            const newCompleted = new Set(data.completed)
            if (toCompleted) nodes.forEach((n) => newCompleted.add(n))
            else nodes.forEach((n) => newCompleted.delete(n))
            return { completed: Array.from(newCompleted) }
        })
    }
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
        <GraphViewWrapper
            data={currData}
            nodeClasses={{
                faded: childElements,
                outlined: targetNode ? [targetNode] : undefined,
            }}
        />
    </div>
    {#if node !== null}
        <div class="front">
            <QuestInfo {node} />
        </div>
        <div class="buttons">
            {#if node.noob}
                <Button
                    Icon={{ src: DofusPourLesNoobs }}
                    href={node.noob}
                    title="Dofus pour les noobs"
                />
            {/if}
            <Button
                Icon={{ src: DofusDB }}
                href={(node.type === 'quest'
                    ? 'https://dofusdb.fr/fr/database/quest/'
                    : 'https://dofusdb.fr/fr/database/achievements/') +
                    node.id.slice(1)}
                title="DofusDB"
            />
            <Button
                Icon={isCompleted ? X : Check}
                title={isCompleted ? 'mark-uncompleted' : 'mark-completed'}
                onclick={handleMarkCompleted(node.id, false)}
            />
            <Button
                Icon={isCompleted ? ListX : CheckList}
                title={isCompleted
                    ? 'mark-all-uncompleted'
                    : 'mark-all-completed'}
                onclick={handleMarkCompleted(node.id, true)}
            />
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
    .buttons {
        position: fixed;
        z-index: 2;
        bottom: 8px;
        left: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    :global(.selectedQuestView) {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
    }
</style>
