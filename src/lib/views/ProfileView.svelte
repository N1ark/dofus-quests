<script lang="ts" module>
    export const imageRoot = 'https://api.beta.dofusdb.fr/img/'
    export const profilePictures = [
        'breeds/symbol_1.png',
        'breeds/symbol_2.png',
        'breeds/symbol_3.png',
        'breeds/symbol_4.png',
        'breeds/symbol_5.png',
        'breeds/symbol_6.png',
        'breeds/symbol_7.png',
        'breeds/symbol_8.png',
        'breeds/symbol_9.png',
        'breeds/symbol_10.png',
        'breeds/symbol_11.png',
        'breeds/symbol_12.png',
        'breeds/symbol_13.png',
        'breeds/symbol_14.png',
        'breeds/symbol_15.png',
        'breeds/symbol_16.png',
        'breeds/symbol_17.png',
        'breeds/symbol_18.png',
        'breeds/symbol_20.png',
    ]
</script>

<script lang="ts">
    import Dice from 'lucide-svelte/icons/dice-6'
    import Pencil from 'lucide-svelte/icons/pencil'
    import Trash from 'lucide-svelte/icons/trash'
    import Female from '../components/icons/Female.svelte'
    import Male from '../components/icons/Male.svelte'

    import Button from '../components/Button.svelte'
    import ColorPicker from '../components/ColorPicker.svelte'
    import Column from '../components/Column.svelte'
    import Row from '../components/Row.svelte'
    import SplitWindow from '../components/SplitWindow.svelte'
    import Text from '../components/Text.svelte'
    import { subscribeToWindowVisibility } from '../components/Window.svelte'
    import { data } from '../data/data'
    import {
        profiles,
        type Profile,
        type ProfileData,
    } from '../data/state.svelte'
    import { get, language, type Lang } from '../locale/localisation.svelte'
    import { tinyId } from '../util'

    const dummyProfile = () => {
        const hex = () =>
            Math.floor(Math.random() * 255)
                .toString(16)
                .padStart(2, '0')
        randomName = Math.floor(Math.random() * 50)
        return {
            id: tinyId(),
            name: '',
            image: Math.floor(Math.random() * profilePictures.length),
            color: '#' + hex() + hex() + hex(),
            title: data.titles[Math.floor(Math.random() * data.titles.length)],
            gender: (['male', 'female'] as const)[
                Math.floor(Math.random() * 2)
            ],
        }
    }

    let ownProfiles: ProfileData = $state({
        current: '',
        profiles: [],
        version: 1,
    })
    profiles.subscribe((p) => (ownProfiles = p))

    let ownLang = $state<Lang>('en')
    language.subscribe((l) => (ownLang = l))

    let editedProfile = $state<string | null>(null)
    let randomName = $state<number>(Math.floor(Math.random() * 50))
    let newProfile = $state<Profile>(dummyProfile())
    let confirmDelete = $state<string | null>(null)
    let confirmDeleteEnabled = $state(false)

    let confirmDeleteEnabledTimeout: number | undefined = undefined
    $effect(() => {
        if (!confirmDelete) confirmDeleteEnabled = false
        else {
            confirmDeleteEnabled = false
            clearTimeout(confirmDeleteEnabledTimeout)
            confirmDeleteEnabledTimeout = setTimeout(() => {
                confirmDeleteEnabled = true
            }, 1000)
        }
    })

    subscribeToWindowVisibility('profile', (vis) => {
        if (vis) {
            newProfile = dummyProfile()
            editedProfile = null
            confirmDelete = null
        }
    })

    const titles = $derived(
        (() => {
            const _unused = ownLang
            return data.titles
                .map((id) => ({
                    id,
                    text: get('t' + id, newProfile.gender),
                }))
                .sort((a, b) => a.text.localeCompare(b.text))
        })()
    )

    const createOrEditProfile = () => {
        if (editedProfile !== null) {
            profiles.update(({ profiles, ...rest }) => ({
                ...rest,
                profiles: profiles.map((p) =>
                    p.id === editedProfile ? newProfile : p
                ),
            }))
            editedProfile = null
            newProfile = dummyProfile()
        } else {
            profiles.update(({ profiles, ...rest }) => ({
                ...rest,
                profiles: [newProfile, ...profiles],
            }))
            newProfile = dummyProfile()
        }
    }

    const selectProfile = (id: string) => {
        if (id === ownProfiles.current) return
        profiles.update(({ ...rest }) => ({ ...rest, current: id }))
    }

    const deleteProfile = (id: string) => {
        profiles.update(({ profiles, current, ...rest }) => {
            const newProfiles = profiles.filter((p) => p.id !== id)
            return {
                ...rest,
                current: current === id ? newProfiles[0].id : current,
                profiles: newProfiles,
            }
        })
    }
</script>

{#snippet profile(profile: Profile, onclick?: () => void)}
    <button
        class="profile profile-colored"
        class:noclick={onclick === undefined}
        class:selected={onclick && ownProfiles.current === profile.id}
        {onclick}
        style:--color={profile.color}
    >
        {#if import.meta.env.DEV}
            <div class="debug">
                {profile.id}
            </div>
        {/if}
        <div class="image-box">
            <img
                src={imageRoot + profilePictures[profile.image]}
                alt=""
                loading="lazy"
            />
        </div>
        <div class="info">
            <div class="name">
                {#if profile.name.trim()}
                    {profile.name.trim()}
                {:else}
                    <Text
                        key="examplename"
                        name={newProfile.gender + '.' + randomName}
                    />
                {/if}
            </div>
            <div class="title">
                <Text key={'t' + profile.title} name={profile.gender} />
            </div>
        </div>
    </button>
{/snippet}

{#snippet top()}
    <Column classes="profile-col">
        <Text element="h3" key="pick-profile" />
        {#each ownProfiles.profiles as p}
            <Row classes="profile-row">
                {@render profile(p, () => selectProfile(p.id))}
                <Button
                    Icon={Pencil}
                    onclick={() => {
                        confirmDelete = null
                        if (editedProfile === p.id) {
                            editedProfile = null
                            newProfile = dummyProfile()
                        } else {
                            editedProfile = p.id
                            newProfile = { ...p }
                        }
                    }}
                    selected={editedProfile === p.id}
                />
                <Button
                    Icon={Trash}
                    onclick={() => {
                        confirmDelete = p.id
                        if (editedProfile !== null) {
                            editedProfile = null
                            newProfile = dummyProfile()
                        }
                    }}
                    disabled={ownProfiles.profiles.length < 2}
                    selected={confirmDelete === p.id}
                />
                {#if confirmDelete === p.id}
                    <button
                        disabled={!confirmDeleteEnabled}
                        class="danger"
                        onclick={() => deleteProfile(p.id)}
                    >
                        <Text key="confirm" />
                    </button>
                {/if}
            </Row>
        {/each}
    </Column>
{/snippet}

{#snippet bottom()}
    <div class="create-column">
        <Text
            element="h3"
            key={editedProfile !== null ? 'edit-profile' : 'create-profile'}
        />
        <div class="create-form">
            <div>
                <input
                    type="text"
                    bind:value={newProfile.name}
                    data-placeholder="profile-name"
                    maxlength="20"
                />
                <ColorPicker
                    color={newProfile.color}
                    classes="colorpick"
                    onchange={(c) => (newProfile.color = c)}
                />
                <div class="genderselect">
                    <select
                        onchange={(e) =>
                            (newProfile.title = +e.currentTarget.value)}
                    >
                        {#key ownLang}
                            {#each titles as title}
                                <option
                                    value={title.id}
                                    selected={newProfile.title === title.id}
                                    >{title.text}</option
                                >
                            {/each}
                        {/key}
                    </select>
                    <Button
                        Icon={Male}
                        selected={newProfile.gender === 'male'}
                        onclick={() => (newProfile.gender = 'male')}
                    />
                    <Button
                        Icon={Female}
                        selected={newProfile.gender === 'female'}
                        onclick={() => (newProfile.gender = 'female')}
                    />
                </div>
            </div>
            <Column classes="icon-list">
                {#each profilePictures as img, i}
                    <Button
                        Icon={{ src: imageRoot + img }}
                        selected={i === newProfile.image}
                        onclick={() => (newProfile.image = i)}
                    />
                {/each}
            </Column>
        </div>
        <Row classes="profile-row preview-row">
            <div class="preview">
                <Text key="preview" />
            </div>
            {@render profile(newProfile)}
            <Button Icon={Dice} onclick={() => (newProfile = dummyProfile())} />
            <button
                onclick={createOrEditProfile}
                disabled={!newProfile.name || newProfile.name.trim().length < 3}
            >
                <Text key={editedProfile !== null ? 'edit' : 'create'} />
            </button>
        </Row>
    </div>
{/snippet}

<SplitWindow
    id="profile"
    name={{ key: 'profiles' }}
    maxWidth={600}
    {top}
    {bottom}
/>

<style>
    :global(.profile-col) {
        height: unset;
    }

    .create-column {
        display: flex;
        flex-direction: column;
        gap: 6px;
        align-items: flex-start;

        & :global(h3) {
            margin: 0.5em 0 0 0;
        }
    }

    .create-form {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px !important;
        height: 100%;

        & > :first-child {
            display: grid;
            gap: 6px;
            flex-shrink: 1;
            flex-grow: 0;
            align-items: start;
            height: fit-content;
        }
    }

    :global(.icon-list) {
        max-height: 140px;
        flex-wrap: wrap;
        overflow-x: auto;
        padding-right: 12px;
        margin-right: -12px;
    }

    :global(.profile-row) {
        align-items: center;
        width: 100%;
        position: relative;

        & > .profile {
            margin-right: 1em;
        }

        &.preview-row {
            margin-top: 1em;
        }
    }

    .genderselect {
        display: flex;
        flex-direction: row;
        /* flex-wrap: wrap; */

        gap: 6px;
        align-items: center;
        min-width: 0;
        max-width: fit-content;

        & > select {
            text-overflow: ellipsis;
            min-width: 0;
            height: 33px;
        }
    }

    :global(.profile-colored) {
        border-color: var(--color) !important;
        background-color: color-mix(
            in srgb,
            var(--color),
            #161616 80%
        ) !important;

        &:hover:not(:global(.noclick)) {
            background-color: color-mix(
                in srgb,
                var(--color),
                #262626 70%
            ) !important;
        }
        &:active:not(:global(.noclick)),
        &:focus:not(:global(.noclick)) {
            border-color: color-mix(
                in srgb,
                var(--color),
                rgba(200, 200, 200, 0.8) 80%
            ) !important;
        }
    }

    .preview {
        font-size: 0.8em;
        font-style: italic;
        opacity: 0.8;
        position: absolute;
        bottom: calc(100%);
        user-select: none;
    }

    .profile {
        position: relative;
        display: flex;
        padding: 6px;
        border-radius: 4px;
        max-width: 260px;
        user-select: none;
        overflow: hidden;
        flex-grow: 1000;
        flex-shrink: 1;

        border-width: 1px;
        border-style: solid;

        transition:
            background-color 0.1s,
            border-color 0.1s;

        &.noclick {
            cursor: default !important;
        }

        &.selected {
            outline: 1px solid white;
            outline-offset: 1px;
            box-shadow: 0 0 7px rgba(255, 255, 255, 0.6);
        }

        & > .image-box {
            margin-right: 6px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            & > img {
                width: 32px;
                height: 32px;
            }
        }

        & .info {
            overflow: hidden;
            text-align: left;
            padding: 0 4px;
        }

        & .name {
            overflow: hidden;
            text-overflow: ellipsis;
        }
        & .title {
            overflow: hidden;
            text-overflow: ellipsis;
            opacity: 70%;
            font-style: italic;
            font-size: 0.8em;
        }

        & .debug {
            position: absolute;
            font-size: 0.8em;
            font-family: monospace;
            left: unset;
            bottom: unset;
            right: 4px;
            top: 0;
            pointer-events: none;
            background-color: color-mix(
                in srgb,
                var(--color),
                #161616 80%
            ) !important;
        }
    }
</style>
