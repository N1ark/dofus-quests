<script lang="ts">
    import { Link } from 'lucide-svelte'
    import type { Achievement, Quest } from '../data'

    let { node }: { node: Quest | Achievement } = $props()
    const url = $derived(
        (node.type === 'quest'
            ? 'https://dofusdb.fr/fr/database/quest/'
            : 'https://dofusdb.fr/fr/database/achievements/') + node.id.slice(1)
    )
    const requirementRegex = /\[(.*?)\]\((.*?)\)/g
</script>

<div class="content">
    <h2>
        {node.name}
        <a
            class="link"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title="DofusDB"
        >
            <Link />
        </a>
    </h2>
    {#if node.description}
        <p>{node.description}</p>
    {/if}
    {#if node.requirements.length > 0}
        <ul>
            {#each node.requirements as requirement}
                <li>
                    {#if requirement.match(requirementRegex)}
                        {@html requirement.replaceAll(
                            requirementRegex,
                            '<a href="#$2">$1</a>'
                        )}
                    {:else}
                        {requirement}
                    {/if}
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
    li,
    h2,
    p {
        width: fit-content;
        pointer-events: auto;
    }

    .link {
        font-size: 0.7em;
        margin: -8px;
        margin-left: 0;
        padding: 8px;
        opacity: 0.7;
        transition: opacity 0.1s;
        &:hover {
            opacity: 1;
        }
    }
</style>
