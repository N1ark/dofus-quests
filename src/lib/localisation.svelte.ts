import { writable } from 'svelte/store'
import translationEn from './tr-en.json'
import translationFr from './tr-fr.json'
import uiTranslationEn from './ui-en.json'
import uiTranslationFr from './ui-fr.json'

export type Lang = 'en' | 'fr'

export const language = writable<Lang>(
    (() => {
        const local = localStorage.getItem('language') as Lang
        if (['en', 'fr'].includes(local)) return local
        const preferred = navigator.language.split('-')[0]
        if (['en', 'fr'].includes(preferred)) return preferred as Lang
        return 'en'
    })()
)

let lang: Translation = translationFr

language.subscribe((value) => {
    if (!['en', 'fr'].includes(value)) {
        console.error('Invalid language:', value)
        language.set('en')
        return
    }
    switch (value) {
        case 'en':
            lang = { ...translationEn, ...uiTranslationEn }
            break
        case 'fr':
            lang = { ...translationFr, ...uiTranslationFr }
            break
    }

    localStorage.setItem('language', value)
})

type Translation = Record<string, string>

export const get = (...keys: string[]): string =>
    lang[keys.join('.')] ?? keys.join('.')
