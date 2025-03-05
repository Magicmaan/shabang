import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { debug } from '@tauri-apps/plugin-log'
import { useEffect, useReducer, useRef, useState } from 'react'

interface State {
    state: 'opening' | 'closing' | 'open' | 'closed'
}

// listens for open_window and close_window events
export const useOpenWindow = () => {
    const [windowOpenState, _setWindowOpenState] = useState<
        'open' | 'closed' | 'closing' | 'opening'
    >('closed')

    // wrapper so that setting outside of this hook is not possible
    const setWindowOpenState = (state: 'open' | 'closed') => {
        if (state === 'open') {
            invoke('open_window')
        } else {
            invoke('close_window')
        }
    }

    // useEffect to mount / unmount
    useEffect(() => {
        // uses events to set the window state
        // transition -> just started opening or closing
        // transition_done -> done opening or closing
        const ot = listen('open_window_transition', (event) => {
            _setWindowOpenState('opening')
        })
        const ct = listen('close_window_transition', () => {
            _setWindowOpenState('closing')
        })
        const otd = listen('open_window_transition_done', () => {
            _setWindowOpenState('open')
        })
        const ctd = listen('close_window_transition_done', () => {
            _setWindowOpenState('closed')
        })

        return () => {
            //unlisten events on unmount
            ot.then((e) => e())
            ct.then((e) => e())
            otd.then((e) => e())
            ctd.then((e) => e())
        }
    }, [])
    return { windowOpenState, setWindowOpenState }
}
