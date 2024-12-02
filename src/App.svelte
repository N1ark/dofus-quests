<script lang="ts">
    import Banner from './lib/images/banner.png'
    import DofusBook from './lib/images/dofusbook.png'
    import DofusDB from './lib/images/dofusdb.png'
    import DofusMap from './lib/images/dofusmap.png'
    import DofusPourLesNoobs from './lib/images/dofusprlesnoobs.png'
    import Favicon from './lib/images/favicon.png'

    import Archive from 'lucide-svelte/icons/archive'
    import Backpack from 'lucide-svelte/icons/backpack'
    import BadgeHelp from 'lucide-svelte/icons/badge-help'
    import Calendar from 'lucide-svelte/icons/calendar'
    import Circle from 'lucide-svelte/icons/circle'
    import CircleOff from 'lucide-svelte/icons/circle-off'
    import Eye from 'lucide-svelte/icons/eye'
    import EyeClosed from 'lucide-svelte/icons/eye-closed'
    import Reload from 'lucide-svelte/icons/refresh-cw'
    import SlidersHorizontal from 'lucide-svelte/icons/sliders-horizontal'
    import Trophy from 'lucide-svelte/icons/trophy'

    import AlmanaxView from './lib/views/AlmanaxView.svelte'
    import BackupView from './lib/views/BackupView.svelte'
    import CategoryView from './lib/views/CategoryView.svelte'
    import HelpView from './lib/views/HelpView.svelte'
    import SelectedQuestView from './lib/views/SelectedQuestView.svelte'

    import { fade } from 'svelte/transition'
    import Button from './lib/components/Button.svelte'
    import Column from './lib/components/Column.svelte'
    import GraphViewWrapper from './lib/components/GraphViewWrapper.svelte'
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
    import LevelFilterView from './lib/views/LevelFilterView.svelte'
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
</script>

<svelte:head>
    <title>Dofus Quests</title>

    <link rel="icon" type="image/png" href={Favicon} />
    <meta property="og:title" content="Dofus Quests" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content={Banner} />
    <meta property="og:image:width" content="1024" />
    <meta property="og:image:height" content="536" />
    <meta property="og:url" content="https://dofus.n1ark.com" />
    <meta
        property="og:description"
        content="Dofus Quests, un outil compréhensif pour le suivi de la progression dans Dofus !"
    />
    <meta
        name="description"
        content="Dofus Quests, un outil compréhensif pour le suivi de la progression dans Dofus !"
    />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content={Banner} />
    <meta name="twitter:site" content="@N1ark_" />
    <meta name="twitter:creator" content="@N1ark_" />
    <meta name="twitter:title" content="Dofus Quests" />
</svelte:head>

<main>
    <div
        style:width="100%"
        style:height="100%"
        transition:fade={{
            duration: 200,
            easing: (t) => -1 * Math.cos(t * (Math.PI / 2)) + 1,
        }}
    >
        <GraphViewWrapper
            {data}
            refresh={refreshIdx}
            {showGroups}
            usePresetPositions
            debugAllowed
        />
    </div>
    <div class="buttonColumn">
        <Button
            Icon={{ src: imageRoot + profilePictures[ownProfile.image] }}
            title="profiles"
            onclick={() => swapWindowVisibility('profile')}
            ondblclick={() => resetWindowPosition('profile')}
            classes="profile-colored"
            --color={ownProfile.color}
        />
        <Column classes="wrap">
            <Button
                Icon={Backpack}
                title="quests"
                onclick={() => swapWindowVisibility('quests')}
                ondblclick={() => resetWindowPosition('quests')}
            />
            <Button
                Icon={Trophy}
                title="achievements"
                onclick={() => swapWindowVisibility('achievements')}
                ondblclick={() => resetWindowPosition('achievements')}
            />
            <Button
                Icon={Calendar}
                title="almanax"
                onclick={() => swapWindowVisibility('almanax')}
                ondblclick={() => resetWindowPosition('almanax')}
            />
            <Button
                Icon={Archive}
                title="backup"
                onclick={() => swapWindowVisibility('backup')}
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
                Icon={SlidersHorizontal}
                title="level-filter"
                onclick={() => swapWindowVisibility('level-filter')}
                ondblclick={() => resetWindowPosition('level-filter')}
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
            onclick={() => swapWindowVisibility('help')}
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
        <LevelFilterView />
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
            height: min-content;
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
