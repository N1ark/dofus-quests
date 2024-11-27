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
        flex-direction: column;
        gap: 6px;
        height: 100%;
    }
</style>
