<script lang="ts">
    import type { Snippet } from 'svelte'

    const { children, classes }: { children: Snippet; classes?: string } =
        $props()
</script>

<div class="column {classes ?? ''}">
    {@render children()}
</div>

<style>
    .column {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
</style>
