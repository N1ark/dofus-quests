<script lang="ts">
    import Archive from 'lucide-svelte/icons/archive'
    import Calendar from 'lucide-svelte/icons/calendar'
    import Eye from 'lucide-svelte/icons/eye'
    import EyeClosed from 'lucide-svelte/icons/eye-closed'
    import Reload from 'lucide-svelte/icons/refresh-cw'

    import { onMount } from 'svelte'
    import AlmanaxModal from './lib/components/AlmanaxModal.svelte'
    import BackupPopup from './lib/components/BackupPopup.svelte'
    import Button from './lib/components/Button.svelte'
    import Column from './lib/components/Column.svelte'
    import GraphView from './lib/components/GraphView.svelte'
    import Row from './lib/components/Row.svelte'
    import SelectedQuestView from './lib/components/SelectedQuestView.svelte'
    import { data } from './lib/data'
    import { showCompleted } from './state.svelte'

    let refreshIdx = $state(1)
    let ownShowCompleted = $state(false)
    showCompleted.subscribe((value) => {
        ownShowCompleted = value
    })

    onMount(() => {
        const keyListener = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                window.location.hash = ''
            }
        }
        window.addEventListener('keydown', keyListener)
        return () => window.removeEventListener('keydown', keyListener)
    })
</script>

<main>
    <GraphView {data} refresh={refreshIdx} />
    <Row classes="mainContainer">
        <Column classes="column">
            <Button
                Icon={Reload}
                title="Reorganise"
                onclick={() => ++refreshIdx}
            />
            <Button
                Icon={ownShowCompleted ? Eye : EyeClosed}
                title="Show completed"
                onclick={() => showCompleted.update((value) => !value)}
            />
            <Button
                Icon={Archive}
                title="Backup"
                onclick={() =>
                    (window.location.hash =
                        window.location.hash === '#backup' ? '' : 'backup')}
            />
            <Button
                Icon={Calendar}
                title="Almanax"
                onclick={() =>
                    (window.location.hash =
                        window.location.hash === '#almanax' ? '' : 'almanax')}
            />
        </Column>
        <SelectedQuestView />
        <BackupPopup />
        <AlmanaxModal />
    </Row>
</main>

<style>
    main {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
    }

    :global(.column) {
        z-index: 10;
    }

    :global(.mainContainer) {
        position: absolute;
        inset: 16px;
        z-index: 1;
        pointer-events: none;
    }
</style>
