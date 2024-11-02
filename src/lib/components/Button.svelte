<script lang="ts">
    const {
        Icon,
        classes,
        onclick,
        title,
    }: {
        Icon: any
        classes?: string
        onclick?: () => any | Promise<any>
        title?: string
    } = $props()
    let disabled = $state(false)

    const clickHandler = () => {
        if (onclick) {
            const ret = onclick()
            if (ret instanceof Promise) {
                ret.catch(console.error).finally(() => {
                    disabled = false
                })
            } else {
                disabled = false
            }
        }
    }
</script>

<button class={classes} onclick={clickHandler} {title} {disabled}>
    <Icon />
    <span>{title}</span>
</button>

<style>
    button {
        aspect-ratio: 1;
        line-height: 0;
        font-size: 1.2em;

        &:hover span {
            opacity: 1;
        }

        span {
            position: absolute;
            bottom: -1px;
            left: calc(100% + 8px);
            font-size: 0.8em;
            opacity: 0;
            transition: opacity 0.1s;
            pointer-events: none;
            user-select: none;
            line-height: 1;
            background-color: #070809;
            text-align: left;
        }
    }
</style>
