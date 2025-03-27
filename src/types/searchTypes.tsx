import { _bangAction, bangAction } from '@/hooks/search/Bangs'
import { error } from '@tauri-apps/plugin-log'

export type searchTypes =
    | 'calculator'
    | 'file'
    | 'search'
    | 'setting'
    | 'command'
    | 'error'

export const searchTypes: { [key: string]: searchTypes } = {
    calculator: 'calculator', // calculator
    file: 'file', // file search
    search: 'search', // web search
    setting: 'setting', // settings
    command: 'command', // command in cmd / powershell
    error: 'error',
}

export type EverythingData = {
    readable_name: string
    name: string
    path: string
    category: string
}

export type ControlPanelData = {
    readable_name: string
    name: string
    category: string
}

export type ApplicationData = {
    readable_name: string
    name: string
    path: string
    category: string
}

export type InternetData = {
    url: string
    name: string
}

export type BangData = {
    bang: string
    query: string
    url: string
}

export type searchResults = {
    everything?: EverythingData[]
    controlpanel?: ControlPanelData[]
    application?: ApplicationData[]
    calculator?: string
    internet?: InternetData
    bang?: bangAction
}

export type EverythingErrorName =
    | 'IPC is not available.'
    | 'Error searching.'
    | 'No results.'
    | 'No query.'

export class EverythingError extends Error {
    constructor(
        public name: EverythingErrorName,
        message?: string
    ) {
        super(message)
        this.name = name
    }
}
