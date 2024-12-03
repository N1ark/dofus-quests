import { mount } from 'svelte'
import App from './App.svelte'
import './style.css'

import { injectAnalytics } from '@vercel/analytics/sveltekit'

injectAnalytics({ mode: import.meta.env.DEV ? 'development' : 'production' })

const app = mount(App, {
    target: document.getElementById('app')!,
})

export default app
