<script lang="ts" module>
    export const progressText = (amount: number, total: number) =>
        `${Math.floor((amount / total) * 100)}% (${amount}/${total})`
</script>

<script lang="ts">
    const { amount, total }: { amount: number; total: number } = $props()
</script>

<span class="base" class:completed={amount === total}>
    {Math.floor((amount / total) * 100)}%
    <span class="detail">({amount} / {total})</span>
</span>

<style>
    .base {
        font-size: 0.7em;
        opacity: 0.7;
        margin: 0 8px;
        &.completed {
            color: #fae089;
            opacity: 0.9;
        }
        & .detail {
            font-size: 0.8em;
        }
    }
</style>
