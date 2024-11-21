<script lang="ts">
    import { data, type Achievement, type Quest } from '../data/data'
    import { language, type Lang } from '../locale/localisation.svelte'
    import { selectCategory } from '../views/CategoryView.svelte'
    import { selectNode } from '../views/SelectedQuestView.svelte'
    import Text from './Text.svelte'

    type Translated = Record<string, string>
    type Obj<T, V = {}> = { id: number; type: T } & V
    type CriterionAtom =
        | string
        | number
        | Obj<'quest-objectives', { text: CriterionAtom[] }>
        | Obj<'quests', { name: Translated }>
        | Obj<'achievements', { name: Translated }>
        | Obj<'breeds', { shortName: Translated }>
        | Obj<'positions', { posX: number; posY: number }>
        | Obj<'npcs', { name: Translated }>
        | Obj<'alignments', { name: Translated }>
        | Obj<'alignment-ranks', { name: Translated }>
        | Obj<'items', { name: Translated }>
        | Obj<'monsters', { name: Translated }>
        | Obj<'jobs', { name: Translated }>
        // fallback for unknown criterion types:
        | Obj<'unknown', { type: string }>

    type CriterionList = ('|' | '&' | CriterionAtom[] | CriterionList)[]

    let ownLang = $state<Lang>('en')
    language.subscribe((l) => (ownLang = l))

    let { node }: { node: Quest | Achievement } = $props()
    const category = $derived(
        (node.type === 'achievement'
            ? data.achievementCategories
            : data.questCategories
        ).find((c) => c.id === node.categoryId)!
    )

    let requirements = $state<CriterionList | null | 'error'>(null)
    const fetchRequirements = () => {
        let cleanRequirements = node.requirements
            .replace(/&Qa\!\d+/g, '')
            .replace(/&Qf\!\d+/g, '')

        requirements = null
        fetch(
            `https://api.dofusdb.fr/criterion/${encodeURI(cleanRequirements)}?lang=${ownLang}`
        )
            .then((response) => response.json())
            .then((data: CriterionList) => (requirements = data))
            .catch(() => (requirements = 'error'))
    }
    $effect(() => fetchRequirements())

    const isList = (c: CriterionList[number]): c is CriterionList =>
        Array.isArray(c) && c.length > 0 && (c[1] === '&' || c[1] === '|')
</script>

{#snippet criterionAtom(criterion: CriterionAtom)}
    {#if typeof criterion === 'string'}
        {criterion}
    {:else if typeof criterion === 'number'}
        {criterion}
    {:else if Array.isArray(criterion)}
        {@render criterionBlock(criterion)}
    {:else if typeof criterion === 'object'}
        {#if criterion.type === 'quest-objectives'}
            {#each criterion.text as text}
                {@render criterionAtom(text)}
            {/each}
        {:else if criterion.type === 'quests'}
            <button class="link" onclick={() => selectNode('q' + criterion.id)}>
                {criterion.name[ownLang]}
            </button>
        {:else if criterion.type === 'achievements'}
            <button class="link" onclick={() => selectNode('a' + criterion.id)}>
                {criterion.name[ownLang]}
            </button>
        {:else if criterion.type === 'breeds'}
            <it>{criterion.shortName[ownLang]}</it>
        {:else if criterion.type === 'positions'}
            <it>[{criterion.posX}, {criterion.posY}]</it>
        {:else if criterion.type === 'npcs' || criterion.type === 'alignments' || criterion.type === 'alignment-ranks' || criterion.type === 'monsters' || criterion.type === 'jobs'}
            <it>{criterion.name[ownLang]}</it>
        {:else if criterion.type === 'items'}
            <a
                href={`https://dofusdb.fr/fr/database/object/${criterion.id}`}
                rel="noopener noreferrer"
                target="_blank">{criterion.name[ownLang]}</a
            >
        {:else}
            <span style:color="red">(type: {criterion?.type})</span>
        {/if}
    {:else}
        <span style:color="red">Unknown criterion type.</span>
    {/if}
{/snippet}

{#snippet criterionBlock(criterion: CriterionList)}
    {#if criterion.length === 1}
        {#each criterion[0] as c}
            {@render criterionAtom(c as CriterionAtom)}
        {/each}
    {:else if criterion.length % 2 === 1}
        {@const textName = criterion[1] === '&' ? 'and' : 'or'}
        <ul>
            {#each criterion as c, i}
                {#if i % 2 === 0}
                    {@const isListBlock = isList(c)}
                    <li class:isListBlock>
                        {#if i > 0}<Text key={textName} />{/if}
                        {#if isListBlock}
                            {@render criterionBlock(c)}
                        {:else}
                            {#each c as cc}
                                {@render criterionAtom(cc)}
                            {/each}
                        {/if}
                    </li>
                {/if}
            {/each}
        </ul>
    {:else if criterion.length !== 0}
        <span style:color="red">Weird criterion received (even size).</span>
    {/if}
{/snippet}

{#if category}
    <div class="category">
        <button
            class="link"
            onclick={() => selectCategory(node.type, category.id)}
        >
            <Text key={node.id[0] + 'C' + category.id} name="name" />
        </button>
    </div>
{/if}
<h2>
    <Text key={node.id} name="name" />
</h2>
{#if node.type === 'achievement'}
    <p>
        <Text key={node.id} name="description" />
    </p>
{/if}
<div class="requirements">
    {#if requirements === 'error'}
        <span class="loading">
            <Text key="error-occurred" />
        </span>
    {:else if requirements !== null}
        {@render criterionBlock(requirements)}
    {:else}
        <span class="loading">
            <Text key="loading" />
        </span>
    {/if}
</div>

<style>
    li:not(.isListBlock),
    h2,
    p,
    a {
        width: fit-content;
        pointer-events: auto;
    }

    .loading {
        font-style: italic;
        opacity: 0.5;
    }

    .requirements {
        pointer-events: none;
    }

    p {
        font-style: italic;
    }

    ul {
        width: fit-content;
        pointer-events: none;
        list-style: none;
        border-left: 1px solid transparent;
        padding-left: 0;
        & ul {
            padding-left: 0.5em;
            margin: 0.1em 0;
            border-color: rgba(255, 255, 255, 1);
            & ul {
                border-color: rgba(255, 255, 255, 0.75);
                & ul {
                    border-color: rgba(255, 255, 255, 0.5);
                    & ul {
                        border-color: rgba(255, 255, 255, 0.25);
                    }
                }
            }
        }
    }

    .category {
        font-size: 0.8em;
    }
    .category + h2 {
        margin-top: 0;
    }
</style>
