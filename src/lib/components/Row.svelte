<script lang="ts">
    import type { Snippet } from 'svelte'

    const { children, classes }: { children: Snippet; classes?: string } =
        $props()
</script>

<div class={classes}>
    {@render children()}
</div>

<style>
    div {
        display: flex;
        flex-direction: row;
        gap: 6px;
        width: 100%;
    }
</style>
