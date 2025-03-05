import { error } from '@tauri-apps/plugin-log'

export type searchTypes = 'calculator' | 'file' | 'search' | 'setting' | 'error'

export const searchTypes: { [key: string]: searchTypes } = {
    calculator: 'calculator',
    file: 'file',
    search: 'search',
    setting: 'setting',
    error: 'error',
}

export type EverythingResult = {
    readable_name: string
    name: string
    path: string
    category: string
}

export type ControlPanelResult = {
    readable_name: string
    name: string
    category: string
}

export type ApplicationResult = {
    readable_name: string
    name: string
    path: string
    category: string
}

export type searchResults = {
    everything?: EverythingResult[]
    controlpanel?: ControlPanelResult[]
    application?: ApplicationResult[]
    calculator?: string
}

export type EverythingErrorName =
    | 'IPC is not available.'
    | 'Error searching.'
    | 'No results.'

export class EverythingError extends Error {
    constructor(
        public name: EverythingErrorName,
        message?: string
    ) {
        super(message)
        this.name = name
    }
}
