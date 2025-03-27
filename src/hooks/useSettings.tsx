import { create, StateCreator } from 'zustand'
import defaultSettings, { Settings, SettingsProps } from '@/settings/settings'

// type State = settingsProps

type Action = {
    updateSettings: (newSettings: SettingsProps) => void

    setTheme: (theme: 'light' | 'dark') => void
}

export type SettingsSlice = {
    settings: SettingsProps & Action
}
// create initial settings
function initialiseSettings() {
    let initialState = defaultSettings as SettingsProps

    for (const key in initialState) {
        const value = localStorage.getItem(key)
        if (value) {
            try {
                ;(initialState[key as keyof SettingsProps] as any) =
                    JSON.parse(value)
            } catch (e) {
                console.log('error parsing value for key: ', key)
            }
        } else {
            localStorage.setItem(
                key,
                JSON.stringify(initialState[key as Settings])
            )
            console.log('no value for key: ', key)
        }
    }

    return initialState
}

export const createSettingsSlice: StateCreator<
    SettingsSlice,
    [],
    [],
    SettingsSlice
> = (set, get) => ({
    settings: {
        ...initialiseSettings(),

        updateSettings: (newSettings: SettingsProps) => {
            set((state) => ({
                settings: {
                    ...state.settings,
                    ...newSettings,
                },
            }))
            for (const key in newSettings) {
                localStorage.setItem(
                    key,
                    JSON.stringify(newSettings[key as Settings])
                )
            }
        },

        setTheme: (theme: 'light' | 'dark') => {
            set((state) => ({
                settings: {
                    ...state.settings,
                    theme,
                },
            }))
            localStorage.setItem('theme', theme)
        },
    },
})
