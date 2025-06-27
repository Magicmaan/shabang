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
import { listen } from '@tauri-apps/api/event'

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
    console.log('Creating search channel', SEARCH_CHANNEL)
    console.log('Setting up channel onmessage handler')
    SEARCH_CHANNEL.onmessage = (message) => {
        switch (message.event) {
            case 'started':
                console.log('Search started: ', message)
                onStart && onStart(message as StartedEvent)
                break
            case 'everythingResult':
                console.log('Everything result received:', message)
                onEverythingResult &&
                    onEverythingResult(message as EverythingResultEvent)
                break
            case 'applicationResult':
                console.log('Application result received:', message)
                onAppResult && onAppResult(message as ApplicationResultEvent)
                break
            case 'controlPanelResult':
                console.log('Control panel result received:', message)
                onControlPanelResult &&
                    onControlPanelResult(message as ControlPanelResultEvent)
                break
            case 'progress':
                console.log('Progress: ', message)
                onProgress && onProgress(message as ProgressEvent)
                break
            case 'finished':
                console.log('Finished: ', message)
                onFinished && onFinished(message as FinishedEvent)
                break
            default:
                console.log('Unknown search event: ', message)
                break
        }
    }

    console.log('About to invoke search command')
    const results = invoke<searchResults>('search', {
        query,
        searchOptions: {
            everything: true,
            controlpanel: true,
            application: true,
        },
        onEvent: SEARCH_CHANNEL,
    })

    console.log('Search command completed, results:', results)

    if (!results) {
        throw new EverythingError('No results.', 'No results found')
    }

    return results
}

interface OpenProps {
    path: string
    mode?: 'default' | 'explorer' | 'terminal' | 'default_program' | 'web'
}

function open({ path, mode = 'default' }: OpenProps) {
    invoke('open_link', { link: path, mode: mode })
}

export { search, open }
