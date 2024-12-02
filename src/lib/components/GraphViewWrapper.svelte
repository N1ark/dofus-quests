<script lang="ts" module>
    import { completed, profiles, showCompleted } from '../data/state.svelte'

    let ownCompleted = new Set<string>()
    let ownShowCompleted = true

    const updateFilter = () => {
        setFilter(
            'show-completed',
            ownShowCompleted ? null : (n) => !ownCompleted.has(n.id)
        )
        console.log('filter updated')
    }

    completed.subscribe(({ completed }) => {
        ownCompleted = new Set(completed)
        if (!ownShowCompleted) updateFilter()
    })
    showCompleted.subscribe((value) => {
        ownShowCompleted = value
        updateFilter()
    })
</script>

<script lang="ts">
    import { type ComponentProps } from 'svelte'
    import GraphView, { setFilter } from './GraphView.svelte'

    const {
        nodeClasses: baseNodeClasses = {},
        ...rest
    }: ComponentProps<typeof GraphView> = $props()

    let nodeClasses = $state(baseNodeClasses)
    let refreshPositionsFromStorage = $state(0)

    let nextCompletedChangeRequiresRefresh = false

    if (rest.usePresetPositions) {
        let oldCurrent: string | null = null
        profiles.subscribe((newProfiles) => {
            const newCurrent = newProfiles.current
            if (oldCurrent && oldCurrent !== newCurrent) {
                nextCompletedChangeRequiresRefresh = true
            }
            oldCurrent = newCurrent
        })
    }

    completed.subscribe(({ completed }) => {
        nodeClasses = {
            ...baseNodeClasses,
            finished: new Set(completed),
        }
        if (nextCompletedChangeRequiresRefresh) {
            refreshPositionsFromStorage++
            nextCompletedChangeRequiresRefresh = false
        }
    })

    $effect(() => {
        nodeClasses = {
            ...baseNodeClasses,
            finished: ownCompleted,
        }
    })
</script>

<GraphView {...rest} {nodeClasses} {refreshPositionsFromStorage} />
