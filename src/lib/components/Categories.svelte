<script lang="ts">
    import { onMount } from 'svelte'
    import { completed, showCompleted } from '../../state.svelte'
    import { data } from '../data'
    import { normalize } from '../util'
    import Container from './Container.svelte'
    import Progress from './Progress.svelte'

    const { mode }: { mode: 'quest' | 'achievement' } = $props()

    const categories = $derived(
        (mode === 'quest'
            ? data.questCategories
            : data.achievementCategories
        ).sort((a, b) => a.order - b.order)
    )
    const elements = $derived(
        mode === 'quest'
            ? data.nodes
                  .filter((node) => node.type === mode)
                  .sort((a, b) => +a.id.slice(1) - +b.id.slice(1))
            : data.nodes
                  .filter((node) => node.type === mode)
                  .sort((a, b) => a.order - b.order)
    )
    const hash = $derived(`${mode}s` as const)
    const title = $derived(mode === 'quest' ? 'Quests' : 'Achievements')

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
            visible = window.location.hash.startsWith(`#${hash}`)
            if (!visible) {
                search = ''
                return
            }
            const target = parseInt(
                window.location.hash.slice(`#${hash}-`.length)
            )
            if (isNaN(target)) return
            window.location.hash = hash
            const targetElement = document.getElementById(
                `${mode}category-${target}`
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

<Container classes={`categories ${visible ? '' : 'hidden'}`}>
    <h2>
        {title}
        <Progress
            total={elements.length}
            amount={elements.filter(({ id }) => ownCompleted.has(id)).length}
        />
    </h2>
    <input type="text" placeholder="Search" bind:value={search} />
    {#each categories as category}
        {@const elems = elements.filter((n) => n.categoryId === category.id)}
        {@const completed = elems.filter(({ id }) => ownCompleted.has(id))}
        {@const displayed = elems
            .filter((node) => ownShowCompleted || !ownCompleted.has(node.id))
            .filter((node) => normalize(node.name).includes(searchNormalized))}
        {#if displayed.length !== 0}
            <h3 id={`${mode}category-${category.id}`}>
                {category.name}
                <Progress total={elems.length} amount={completed.length} />
            </h3>
            <ul class={mode}>
                {#each displayed as elem}
                    <li class:completed={ownCompleted.has(elem.id)}>
                        <a href={`#${elem.id}`}>
                            {elem.name}
                        </a>
                    </li>
                {/each}
            </ul>
        {/if}
    {/each}
</Container>

<style>
    :global(.categories) {
        height: fit-content;
        pointer-events: all;
        max-height: 100%;
        overflow-y: auto !important;
        scrollbar-gutter: stable;

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

        &.achievement li {
            &::marker {
                color: #e0961f;
            }
            &.completed::marker {
                color: #a0d13d;
            }
        }
        &.quest li {
            &::marker {
                color: #256fd1;
            }
            &.completed::marker {
                color: #3dd17d;
            }
        }
    }
</style>
