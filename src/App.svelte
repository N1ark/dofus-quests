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

    import AlmanaxView from './lib/views/AlmanaxView.svelte'
    import BackupView from './lib/views/BackupView.svelte'
    import CategoryView from './lib/views/CategoryView.svelte'
    import HelpView from './lib/views/HelpView.svelte'
    import SelectedQuestView from './lib/views/SelectedQuestView.svelte'

    import Button from './lib/components/Button.svelte'
    import Column from './lib/components/Column.svelte'
    import GraphView from './lib/components/GraphView.svelte'
    import {
        resetWindowPosition,
        swapWindowVisibility,
    } from './lib/components/Window.svelte'
    import { data } from './lib/data/data'
    import {
        profiles,
        showCompleted,
        type Profile,
    } from './lib/data/state.svelte'
    import { language, type Lang } from './lib/locale/localisation.svelte'
    import ProfileView, {
        imageRoot,
        profilePictures,
    } from './lib/views/ProfileView.svelte'

    let refreshIdx = $state(0)
    let showGroups = $state(true)
    let ownShowCompleted = $state(false)
    let ownLanguage = $state<Lang>('en')
    let ownProfile = $state<Profile>({ color: '#000', image: 0 } as any)

    showCompleted.subscribe((value) => (ownShowCompleted = value))
    language.subscribe((value) => (ownLanguage = value))
    profiles.subscribe(
        ({ profiles, current }) =>
            (ownProfile = profiles.find((p) => p.id === current)!)
    )

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
        <Button
            Icon={{ src: imageRoot + profilePictures[ownProfile.image] }}
            title="profiles"
            onclick={navigateOrLeave('profile')}
            ondblclick={() => resetWindowPosition('profile')}
            classes="profile-colored"
            --color={ownProfile.color}
        />
        <Column classes="wrap">
            <Button
                Icon={Backpack}
                title="quests"
                onclick={navigateOrLeave('quests')}
                ondblclick={() => resetWindowPosition('quests')}
            />
            <Button
                Icon={Trophy}
                title="achievements"
                onclick={navigateOrLeave('achievements')}
                ondblclick={() => resetWindowPosition('achievements')}
            />
            <Button
                Icon={Calendar}
                title="almanax"
                onclick={navigateOrLeave('almanax')}
                ondblclick={() => resetWindowPosition('almanax')}
            />
            <Button
                Icon={Archive}
                title="backup"
                onclick={navigateOrLeave('backup')}
                ondblclick={() => resetWindowPosition('backup')}
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
            ondblclick={() => resetWindowPosition('help')}
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
        <BackupView />
        <AlmanaxView />
        <CategoryView mode="quest" />
        <CategoryView mode="achievement" />
        <HelpView />
        <ProfileView />
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
