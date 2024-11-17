<script lang="ts">
    import Archive from 'lucide-svelte/icons/archive'
    import Backpack from 'lucide-svelte/icons/backpack'
    import Calendar from 'lucide-svelte/icons/calendar'
    import Circle from 'lucide-svelte/icons/circle'
    import CircleOff from 'lucide-svelte/icons/circle-off'
    import Eye from 'lucide-svelte/icons/eye'
    import EyeClosed from 'lucide-svelte/icons/eye-closed'
    import Reload from 'lucide-svelte/icons/refresh-cw'
    import Trophy from 'lucide-svelte/icons/trophy'

    import DofusBook from './lib/images/dofusbook.png'
    import DofusDB from './lib/images/dofusdb.png'
    import DofusMap from './lib/images/dofusmap.png'
    import DofusPourLesNoobs from './lib/images/dofusprlesnoobs.png'

    import AlmanaxModal from './lib/components/AlmanaxModal.svelte'
    import BackupPopup from './lib/components/BackupPopup.svelte'
    import Button from './lib/components/Button.svelte'
    import Categories from './lib/components/Categories.svelte'
    import Column from './lib/components/Column.svelte'
    import GraphView from './lib/components/GraphView.svelte'
    import Row from './lib/components/Row.svelte'
    import SelectedQuestView from './lib/components/SelectedQuestView.svelte'
    import { swapWindowVisibility } from './lib/components/Window.svelte'
    import { data } from './lib/data'
    import { language, type Lang } from './lib/localisation.svelte'
    import { showCompleted } from './lib/state.svelte'

    let refreshIdx = $state(0)
    let showGroups = $state(true)
    let ownShowCompleted = $state(false)
    showCompleted.subscribe((value) => (ownShowCompleted = value))
    let ownLanguage = $state<Lang>('en')
    language.subscribe((value) => (ownLanguage = value))

    const navigateOrLeave = (id: string) => () => swapWindowVisibility(id)
</script>

{#snippet imageIcon(name: string)}
    <img src={`assets/${name}.png`} alt={name} />
{/snippet}

<main>
    <GraphView
        {data}
        refresh={refreshIdx}
        {showGroups}
        usePresetPositions
        debugAllowed
    />
    <Row classes="mainContainer">
        <Column classes="column">
            <Button
                Icon={Backpack}
                title="quests"
                onclick={navigateOrLeave('quests')}
            />
            <Button
                Icon={Trophy}
                title="achievements"
                onclick={navigateOrLeave('achievements')}
            />
            <Button
                Icon={Calendar}
                title="almanax"
                onclick={navigateOrLeave('almanax')}
            />
            <Button
                Icon={Archive}
                title="backup"
                onclick={navigateOrLeave('backup')}
            />
            <div style:margin-top="8px"></div>
            <Button
                Icon={Reload}
                title="reorganise"
                onclick={() => ++refreshIdx}
            />
            <Button
                Icon={ownShowCompleted ? Eye : EyeClosed}
                title="showcompleted"
                onclick={() => showCompleted.update((value) => !value)}
            />
            <Button
                Icon={showGroups ? Circle : CircleOff}
                title="showgroups"
                onclick={() => (showGroups = !showGroups)}
            />
            <div style:flex-grow="100" style:flex-shrink="0"></div>
            <Button
                Icon={{
                    en: '🇬🇧',
                    fr: '🇫🇷',
                }[ownLanguage]}
                title="language"
                onclick={() =>
                    language.update((l) => (l === 'en' ? 'fr' : 'en'))}
            />
            <Button
                Icon={{ src: DofusMap }}
                title="Dofus Map"
                href="https://dofus-map.com/"
            />
            <Button
                Icon={{ src: DofusPourLesNoobs }}
                title="Dofus pour les Noobs"
                href="https://www.dofuspourlesnoobs.com/"
            />
            <Button
                Icon={{ src: DofusBook }}
                title="dofusbook"
                href="https://www.dofusbook.net/"
            />
            <Button
                Icon={{ src: DofusDB }}
                title="DofusDB"
                href="https://dofusdb.fr/"
            />
        </Column>
    </Row>
    <div class="windows">
        <SelectedQuestView />
        <BackupPopup />
        <AlmanaxModal />
        <Categories mode="quest" />
        <Categories mode="achievement" />
    </div>
</main>

<style>
    main {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
    }

    :global(.mainContainer) {
        position: absolute;
        inset: 16px;
        z-index: 50;
        pointer-events: none;
    }

    .windows {
        position: fixed;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
    }
</style>
