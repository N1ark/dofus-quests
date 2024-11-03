<script lang="ts">
    import type { Snippet } from 'svelte'
    const { children, classes }: { children: Snippet; classes?: string } =
        $props()
</script>

<div class={(classes ?? '') + ' container'}>
    {@render children()}
</div>

<style>
    .container {
        background-color: #181818e0;
        border: 1px solid rgba(128, 128, 128, 0.4);
        border-radius: 4px;
        padding: 16px;
        overflow: hidden;
        backdrop-filter: blur(2px);
        box-sizing: border-box;
    }
</style>
