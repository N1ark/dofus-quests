<script lang="ts">
    import type { Snippet } from 'svelte'

    const { children, classes }: { children: Snippet; classes?: string } =
        $props()
</script>

<div class="row {classes ?? ''}">
    {@render children()}
</div>

<style>
    .row {
        display: flex;
        flex-direction: row;
        gap: 6px;
    }
</style>
