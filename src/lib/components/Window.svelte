<!-- svelte-ignore a11y_no_static_element_interactions -->
<script lang="ts" module>
    const windowOrder: string[] = []
    const listeners: [string, (order: number) => void][] = []
    const subscribeWindowOrder = (
        id: string,
        callback: (order: number) => void
    ) => {
        listeners.push([id, callback])
    }
    const pushWindowToFront = (id: string) => {
        const index = windowOrder.indexOf(id)
        if (index === -1) {
            windowOrder.push(id)
        } else {
            windowOrder.splice(index, 1)
            windowOrder.push(id)
        }
        listeners.forEach(([id, callback]) => {
            callback(windowOrder.indexOf(id))
        })
    }
    const popWindow = (id: string) => {
        const index = windowOrder.indexOf(id)
        if (index !== -1) {
            windowOrder.splice(index, 1)
        }
        listeners.forEach(([id, callback]) => {
            callback(windowOrder.indexOf(id))
        })
    }
</script>

<script lang="ts">
    import type { Snippet } from 'svelte'
    import {
        getWindowInfo,
        setWindowInfo,
        subscribeToWindowVisibility,
    } from '../state.svelte'
    import Text from './Text.svelte'
    const {
        id,
        name,
        nameSecondary,
        children,
        classes,
    }: {
        id: string
        name?: string
        nameSecondary?: string
        children: Snippet
        classes?: string
    } = $props()

    let dimensions = $state(getWindowInfo(id))
    let fullyHidden = $state(!dimensions.visible)
    let zIndex = $state(3)

    $effect(() => {
        subscribeToWindowVisibility(id, (visible) => {
            if (visible === dimensions.visible) return
            if (visible) {
                fullyHidden = false
                setTimeout(() => (dimensions.visible = true), 20)
            } else {
                dimensions.visible = visible
            }
        })
        subscribeWindowOrder(id, (order) => {
            zIndex = order + 3
        })
    })

    let saveInterval: number
    let hiddenInterval: number
    $effect(() => {
        const _unused = dimensions

        if (!dimensions.visible) {
            popWindow(id)
            hiddenInterval = setTimeout(() => (fullyHidden = true), 200)
        } else {
            pushWindowToFront(id)
            clearInterval(hiddenInterval)
            fullyHidden = false
        }

        saveInterval = setTimeout(() => setWindowInfo(id, dimensions), 100)
        return () => clearInterval(saveInterval)
    })

    const onMove = (e: MouseEvent) => {
        const startX = e.clientX
        const startY = e.clientY
        const startLeft = dimensions.x
        const startTop = dimensions.y

        const onMouseMove = (e: MouseEvent) => {
            dimensions.x = startLeft + e.clientX - startX
            dimensions.y = Math.max(0, startTop + e.clientY - startY)
        }

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
        }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
    }

    const onResize =
        (dim: 'left' | 'right' | 'bottom' | 'bottomleft' | 'bottomright') =>
        (e: MouseEvent) => {
            e.preventDefault()
            const startX = e.clientX
            const startY = e.clientY
            const og = { ...dimensions }

            const onMouseMove = (e: MouseEvent) => {
                const left = () => {
                    dimensions.width = Math.max(
                        200,
                        og.width - (e.clientX - startX)
                    )
                    dimensions.x = og.x + og.width - dimensions.width
                }
                const right = () => {
                    dimensions.width = Math.max(
                        200,
                        og.width + (e.clientX - startX)
                    )
                }
                const bottom = () => {
                    dimensions.height = Math.max(
                        200,
                        og.height + (e.clientY - startY)
                    )
                }

                switch (dim) {
                    case 'left':
                        left()
                        break
                    case 'right':
                        right()
                        break
                    case 'bottom':
                        bottom()
                        break
                    case 'bottomleft':
                        left()
                        bottom()
                        break
                    case 'bottomright':
                        right()
                        bottom()
                        break
                }
            }

            const onMouseUp = () => {
                window.removeEventListener('mousemove', onMouseMove)
                window.removeEventListener('mouseup', onMouseUp)
            }

            window.addEventListener('mousemove', onMouseMove)
            window.addEventListener('mouseup', onMouseUp)
        }

    $effect(() => {
        const handler = (e: KeyboardEvent) => {
            if (
                e.key === 'Escape' &&
                windowOrder[windowOrder.length - 1] === id
            ) {
                dimensions.visible = false
                e.preventDefault()
                e.stopImmediatePropagation()
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    })
</script>

<div
    class={(classes ?? '') + ' container'}
    class:visible={dimensions.visible}
    class:fully-hidden={fullyHidden}
    style="top: {dimensions.y}px; left: {dimensions.x}px; width: {dimensions.width}px; height: {dimensions.height}px"
    style:z-index={zIndex}
    onmousedown={() => pushWindowToFront(id)}
>
    <div class="topbar" onmousedown={onMove}>
        {#if name}
            <span>
                <Text key={name} />
            </span>
        {/if}
        {#if nameSecondary}
            <span class="secondary">{nameSecondary}</span>
        {/if}
    </div>
    <div class="resizer left" onmousedown={onResize('left')}></div>
    <div class="resizer right" onmousedown={onResize('right')}></div>
    <div class="resizer bottom" onmousedown={onResize('bottom')}></div>
    <div class="resizer bottomleft" onmousedown={onResize('bottomleft')}></div>
    <div
        class="resizer bottomright"
        onmousedown={onResize('bottomright')}
    ></div>
    <div class="content">
        {@render children()}
    </div>
</div>

<style>
    .container {
        z-index: 2;
        background-color: #181818e0;
        border: 1px solid rgba(128, 128, 128, 0.4);
        border-radius: 4px;
        backdrop-filter: blur(2px);
        box-sizing: border-box;
        position: absolute;
        padding-top: 20px;
        max-width: 100%;
        max-height: 100%;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);

        opacity: 0;
        pointer-events: none;
        user-select: none;
        transform: translateY(-6px);

        transition:
            opacity 0.1s,
            transform 0.1s;

        &.visible {
            opacity: 1;
            pointer-events: all;
            user-select: auto;
            transform: translateY(0);
        }

        &.fully-hidden {
            display: none;
        }
    }

    .content {
        box-sizing: border-box;
        height: 100%;
        overflow: auto;
        scrollbar-gutter: stable;
        pointer-events: auto;
        padding: 4px 12px 12px 12px;
    }

    .topbar {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 20px;
        pointer-events: all;
        cursor: move;
        background-color: #090909;
        z-index: 2;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border-bottom: 1px solid rgba(128, 128, 128, 0.3);
        user-select: none;
        padding: 4px;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        align-items: center;

        & > span {
            font-size: 10px;
            font-weight: 700;
            color: #ddd;
            font-variant: frac;

            &.secondary {
                margin-left: auto;
                opacity: 0.5;
                font-weight: 500;
            }
        }
    }

    .resizer {
        position: absolute;
        width: 8px;
        height: 8px;
        pointer-events: all;
        /* border: 1px solid red; */
        box-sizing: content-box;
        &.left {
            top: 0;
            left: -6px;
            height: 100%;
            cursor: ew-resize;
            z-index: 1;
        }
        &.right {
            top: 0;
            right: -6px;
            height: 100%;
            cursor: ew-resize;
            z-index: 1;
        }
        &.bottom {
            bottom: -6px;
            left: 0;
            width: 100%;
            cursor: ns-resize;
            z-index: 1;
        }
        &.bottomleft {
            width: 12px;
            height: 12px;
            bottom: -6px;
            left: -6px;
            cursor: nesw-resize;
            z-index: 3;
            border-color: green;
        }
        &.bottomright {
            width: 12px;
            height: 12px;
            bottom: -6px;
            right: -6px;
            cursor: nwse-resize;
            z-index: 3;
            border-color: green;
        }
    }
</style>
