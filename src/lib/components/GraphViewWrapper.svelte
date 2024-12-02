<script lang="ts">
    import { untrack, type ComponentProps } from 'svelte'
    import { completed, profiles, showCompleted } from '../data/state.svelte'
    import GraphView, { setFilter } from './GraphView.svelte'

    const {
        nodeClasses: baseNodeClasses = {},
        ...rest
    }: ComponentProps<typeof GraphView> = $props()

    let ownCompleted = $state.raw(new Set<string>())
    let ownShowCompleted = $state(true)
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

    completed.subscribe(({ completed }) => (ownCompleted = new Set(completed)))
    showCompleted.subscribe((value) => (ownShowCompleted = value))

    $effect(() => {
        nodeClasses = {
            ...baseNodeClasses,
            finished: ownCompleted,
        }
        if (nextCompletedChangeRequiresRefresh) {
            refreshPositionsFromStorage++
            nextCompletedChangeRequiresRefresh = false
        }
    })
    $effect(() => {
        const _unused1 = ownShowCompleted,
            _unused2 = ownCompleted
        untrack(() => {
            setFilter(
                'show-completed',
                ownShowCompleted ? null : (n) => !ownCompleted.has(n.id)
            )
        })
    })
</script>

<GraphView {...rest} {nodeClasses} {refreshPositionsFromStorage} />
