import {
    ApplicationData,
    EverythingData,
    ControlPanelData,
    searchTypes,
    searchResults,
} from './searchTypes'

export type ApplicationResultEvent = {
    event: 'applicationResult'
    data: {
        startTime: number
        time: number
        query: string
        data: ApplicationData[]
    }
}
export type EverythingResultEvent = {
    event: 'everythingResult'
    data: {
        startTime: number
        time: number
        query: string
        data: EverythingData[]
    }
}
export type ControlPanelResultEvent = {
    event: 'controlPanelResult'
    data: {
        startTime: number
        time: number
        query: string
        data: ControlPanelData[]
    }
}
export type ProgressEvent = {
    event: 'progress'
    data: { query: string; searchType: searchTypes; time: number }
}
export type StartedEvent = {
    event: 'started'
    data: { query: string; startTime: number }
}
export type FinishedEvent = {
    event: 'finished'
    data: { startTime: number; time: number; data: searchResults }
}

export type SearchEvent =
    | ApplicationResultEvent
    | EverythingResultEvent
    | ControlPanelResultEvent
    | ProgressEvent
    | StartedEvent
    | FinishedEvent
