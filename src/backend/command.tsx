import {
    SearchEvent,
    FinishedEvent,
    StartedEvent,
    ProgressEvent,
    ApplicationResultEvent,
    ControlPanelResultEvent,
    EverythingResultEvent,
} from '@/types/searchEvent'
import { EverythingError, searchResults } from '@/types/searchTypes'
import { Channel, invoke, SERIALIZE_TO_IPC_FN } from '@tauri-apps/api/core'

interface SearchProps {
    query: string
    onStart?: (event: StartedEvent) => void
    onEverythingResult?: (results: EverythingResultEvent) => void
    onAppResult?: (results: ApplicationResultEvent) => void
    onControlPanelResult?: (results: ControlPanelResultEvent) => void
    onFinished?: (event: FinishedEvent) => void
    onProgress?: (event: ProgressEvent) => void
}

async function search({
    query,
    onStart,
    onEverythingResult,
    onAppResult,
    onControlPanelResult,
    onFinished,
    onProgress,
}: SearchProps): Promise<searchResults> {
    const SEARCH_CHANNEL = new Channel<SearchEvent>()

    SEARCH_CHANNEL.onmessage = (message) => {
        console.log(`got download event ${message.event}`)
        switch (message.event) {
            case 'started':
                onStart && onStart(message as StartedEvent)
                break
            case 'everythingResult':
                onEverythingResult &&
                    onEverythingResult(message as EverythingResultEvent)
                break
            case 'applicationResult':
                onAppResult && onAppResult(message as ApplicationResultEvent)
                break
            case 'controlPanelResult':
                onControlPanelResult &&
                    onControlPanelResult(message as ControlPanelResultEvent)
                break
            case 'progress':
                console.log('Progress: ', message)
                onProgress && onProgress(message as ProgressEvent)
                break
            case 'finished':
                onFinished && onFinished(message as FinishedEvent)
                break
            default:
                console.log('Unknown search event: ', message)
                break
        }
    }
    const results = invoke('search', {
        query,
        search_options: {
            everything: true,
            applications: true,
            controlPanel: true,
        },
        onEvent: SEARCH_CHANNEL,
    }).then((res) => {
        if (!res) {
            throw new EverythingError('No results.', 'No results found')
        }
        return res as searchResults
    })
    if (!results) {
        throw new EverythingError('No results.', 'No results found')
    }
    return results
}

function open(path: string) {
    invoke('open_link', { link: path })
}

export { search, open }
