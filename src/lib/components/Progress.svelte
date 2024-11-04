<script lang="ts">
    const { amount, total }: { amount: number; total: number } = $props()
</script>

<span class:completed={amount === total}>
    {amount} / {total}
</span>

<style>
    span {
        font-size: 0.7em;
        opacity: 0.7;
        margin: 0 8px;
        &.completed {
            color: #fae089;
            opacity: 0.9;
        }
    }
</style>
