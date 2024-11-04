<script lang="ts">
    import { onMount } from 'svelte'
    import { completed, showCompleted } from '../../state.svelte'
    import { data } from '../data'
    import { normalize } from '../util'
    import Container from './Container.svelte'
    import Progress from './Progress.svelte'

    const categories = data.questCategories.sort((a, b) => a.order - b.order)
    const quests = data.nodes
        .filter((node) => node.type === 'quest')
        .sort((a, b) => +a.id.slice(1) - +b.id.slice(1))

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
            visible = window.location.hash.startsWith('#quests')
            if (!visible) {
                search = ''
                return
            }
            const target = parseInt(
                window.location.hash.slice('#quests-'.length)
            )
            if (isNaN(target)) return
            window.location.hash = 'quests'
            const targetElement = document.getElementById(
                `questcategory-${target}`
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

<Container classes={`quests ${visible ? '' : 'hidden'}`}>
    <h2>
        Quests <Progress
            total={quests.length}
            amount={quests.filter((node) => ownCompleted.has(node.id)).length}
        />
    </h2>
    <input type="text" placeholder="Search" bind:value={search} />
    {#each categories as category}
        {@const qusts = quests.filter((n) => n.categoryId === category.id)}
        {@const completed = qusts.filter((node) => ownCompleted.has(node.id))}
        {@const displayed = qusts
            .filter((node) => ownShowCompleted || !ownCompleted.has(node.id))
            .filter((node) => normalize(node.name).includes(searchNormalized))}
        {#if displayed.length !== 0}
            <h3 id={`questcategory-${category.id}`}>
                {category.name}
                <Progress total={qusts.length} amount={completed.length} />
            </h3>
            <ul>
                {#each displayed as quest}
                    <li class:completed={ownCompleted.has(quest.id)}>
                        <a href={`#${quest.id}`}>
                            {quest.name}
                        </a>
                    </li>
                {/each}
            </ul>
        {/if}
    {/each}
</Container>

<style>
    :global(.quests) {
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
            color: #256fd1;
        }
        &.completed::marker {
            color: #3dd17d;
        }
    }
</style>
