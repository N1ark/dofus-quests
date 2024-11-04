<script lang="ts">
    import { onMount } from 'svelte'
    import { completed, showCompleted } from '../../state.svelte'
    import { data } from '../data'
    import { normalize } from '../util'
    import Container from './Container.svelte'
    import Progress from './Progress.svelte'

    const categories = data.achievementCategories.sort(
        (a, b) => a.order - b.order
    )
    const achievements = data.nodes
        .filter((node) => node.type === 'achievement')
        .sort((a, b) => a.order - b.order)

    let ownCompleted = $state(new Set<string>())
    let ownShowCompleted = $state(false)
    let visible = $state(false)
    let search = $state('')
    const searchNormalized = $derived(normalize(search))

    completed.subscribe(({ completed }) => {
        ownCompleted = new Set(completed)
    })
    showCompleted.subscribe((value) => {
        ownShowCompleted = value
    })

    onMount(() => {
        const hashCheck = () => {
            visible = window.location.hash.startsWith('#achievements')
            if (!visible) {
                search = ''
                return
            }
            const target = parseInt(
                window.location.hash.slice('#achievements-'.length)
            )
            if (isNaN(target)) return
            window.location.hash = 'achievements'
            const targetElement = document.getElementById(
                `achievementcategory-${target}`
            )
            if (!targetElement) return
            setTimeout(() => {
                targetElement.scrollIntoView({ behavior: 'smooth' })
            }, 100)
        }

        hashCheck()
        window.addEventListener('hashchange', hashCheck)
        return () => window.removeEventListener('hashchange', hashCheck)
    })
</script>

<Container classes={`achievements ${visible ? '' : 'hidden'}`}>
    <h2>
        Achievements <Progress
            total={achievements.length}
            amount={achievements.filter((node) => ownCompleted.has(node.id))
                .length}
        />
    </h2>
    <input type="text" placeholder="Search" bind:value={search} />
    {#each categories as category}
        {@const achs = achievements.filter((n) => n.categoryId === category.id)}
        {@const completed = achs.filter((node) => ownCompleted.has(node.id))}
        {@const displayed = achs
            .filter((node) => ownShowCompleted || !ownCompleted.has(node.id))
            .filter((node) => normalize(node.name).includes(searchNormalized))}
        {#if displayed.length !== 0}
            <h3 id={`achievementcategory-${category.id}`}>
                {category.name}
                <Progress total={achs.length} amount={completed.length} />
            </h3>
            <ul>
                {#each displayed as achievement}
                    <li class:completed={ownCompleted.has(achievement.id)}>
                        <a href={`#${achievement.id}`}>
                            {achievement.name}
                        </a>
                    </li>
                {/each}
            </ul>
        {/if}
    {/each}
</Container>

<style>
    :global(.achievements) {
        height: fit-content;
        pointer-events: all;
        max-height: 100%;
        overflow-y: auto !important;

        &:global(.hidden) {
            display: none;
        }
    }
    h3 {
        margin-bottom: 4px;
        scroll-margin-top: 1em;
    }
    ul {
        margin-top: 0;
        padding-inline-start: 1em;
    }
    li {
        &::marker {
            color: #e0961f;
        }
        &.completed::marker {
            color: #a0d13d;
        }
    }
</style>
