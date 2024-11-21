<script lang="ts">
    import Archive from 'lucide-svelte/icons/archive'
    import Backpack from 'lucide-svelte/icons/backpack'
    import BadgeHelp from 'lucide-svelte/icons/badge-help'
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
    import HelpView from './lib/components/HelpView.svelte'
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

<main>
    <GraphView
        {data}
        refresh={refreshIdx}
        {showGroups}
        usePresetPositions
        debugAllowed
    />
    <div class="buttonColumn">
        <Column classes="wrap">
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
        </Column>
        <Column classes="wrap">
            <Button
                Icon={Reload}
                title="reorganise"
                onclick={() => ++refreshIdx}
            />
            <Button
                Icon={ownShowCompleted ? Eye : EyeClosed}
                title={ownShowCompleted ? 'hide-completed' : 'show-completed'}
                onclick={() => showCompleted.update((value) => !value)}
            />
            <Button
                Icon={showGroups ? Circle : CircleOff}
                title={showGroups ? 'hide-groups' : 'show-groups'}
                onclick={() => (showGroups = !showGroups)}
            />
        </Column>
        <Button
            Icon={BadgeHelp}
            title="help"
            onclick={navigateOrLeave('help')}
        />
        <Column classes="wrap last">
            <div style:flex-grow="1" style:flex-shrink="0"></div>
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
    </div>
    <div class="windows">
        <SelectedQuestView />
        <BackupPopup />
        <AlmanaxModal />
        <Categories mode="quest" />
        <Categories mode="achievement" />
        <HelpView />
    </div>
</main>

<style>
    main {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
    }

    .buttonColumn {
        position: absolute;
        inset: 16px;
        z-index: 50;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        justify-content: flex-start;
        align-content: flex-start;
        gap: 16px;

        & > :global(*) {
            width: min-content;
        }
    }

    :global(.last) {
        flex-grow: 1;
    }

    .windows {
        position: fixed;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
    }
</style>
