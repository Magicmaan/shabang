import { bangAction, bangActionSerialised } from '@/hooks/search/Bangs'
import { searchTypes } from '@/types/searchTypes'
import { defaultBangs, defaultBangSelector } from './defaultBangs'

export type Settings = 'theme' | 'bangSelector' | 'bangs' | 'language'

export interface SettingsProps {
    theme: 'light' | 'dark'
    bangSelector: string[]
    bangs: { [key: string]: bangActionSerialised }
    language: 'en'
}

const defaultSettings: SettingsProps = {
    theme: 'light',
    bangSelector: defaultBangSelector,
    bangs: defaultBangs,
    language: 'en',
}

export default defaultSettings
