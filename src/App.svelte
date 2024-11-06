<script lang="ts">
    import Archive from 'lucide-svelte/icons/archive'
    import Backpack from 'lucide-svelte/icons/backpack'
    import BadgeHelp from 'lucide-svelte/icons/badge-help'
    import Calendar from 'lucide-svelte/icons/calendar'
    import Compass from 'lucide-svelte/icons/compass'
    import Database from 'lucide-svelte/icons/database'
    import Eye from 'lucide-svelte/icons/eye'
    import EyeClosed from 'lucide-svelte/icons/eye-closed'
    import Reload from 'lucide-svelte/icons/refresh-cw'
    import Swords from 'lucide-svelte/icons/swords'
    import Trophy from 'lucide-svelte/icons/trophy'

    import { onMount } from 'svelte'
    import AlmanaxModal from './lib/components/AlmanaxModal.svelte'
    import BackupPopup from './lib/components/BackupPopup.svelte'
    import Button from './lib/components/Button.svelte'
    import Categories from './lib/components/Categories.svelte'
    import Column from './lib/components/Column.svelte'
    import GraphView from './lib/components/GraphView.svelte'
    import Row from './lib/components/Row.svelte'
    import SelectedQuestView from './lib/components/SelectedQuestView.svelte'
    import { data } from './lib/data'
    import { showCompleted } from './state.svelte'

    let refreshIdx = $state(0)
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

    const navigateOrLeave = (hash: string) => () =>
        (window.location.hash = window.location.hash === '#' + hash ? '' : hash)
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
                Icon={Backpack}
                title="Quests"
                onclick={navigateOrLeave('quests')}
            />
            <Button
                Icon={Trophy}
                title="Achievements"
                onclick={navigateOrLeave('achievements')}
            />
            <Button
                Icon={Calendar}
                title="Almanax"
                onclick={navigateOrLeave('almanax')}
            />
            <Button
                Icon={Archive}
                title="Backup"
                onclick={navigateOrLeave('backup')}
            />
            <div style:flex-grow="100" style:flex-shrink="0"></div>
            <Button
                Icon={Compass}
                title="Dofus Map"
                href="https://dofus-map.com/"
            />
            <Button
                Icon={BadgeHelp}
                title="Dofus pour les Noobs"
                href="https://www.dofuspourlesnoobs.com/"
            />
            <Button
                Icon={Swords}
                title="dofusbook"
                href="https://www.dofusbook.net/"
            />
            <Button
                Icon={Database}
                title="DofusDB"
                href="https://dofusdb.fr/"
            />
        </Column>
        <SelectedQuestView />
        <BackupPopup />
        <AlmanaxModal />
        <Categories mode="quest" />
        <Categories mode="achievement" />
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
