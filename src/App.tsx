import { useEffect, useRef, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import './styles/App.css'
import SearchBar from './components/ui/SearchBar'
import QuickWidgets from './components/ui/QuickWidgets.tsx'
import ResultsContainer from './components/ui/Results/index.tsx'
import { useDarkMode } from './hooks/useDarkMode.tsx'
import Widget from './components/ui/base/Widget.tsx'
import { debug } from '@tauri-apps/plugin-log'

import { useOpenWindow } from './hooks/useOpenWindow.tsx'
import { disableCtrlF, disableRefresh } from './util/keyboard.tsx'
import { createSearchSlice } from './hooks/search/useSearch.tsx'
import { UseBlurWindow } from './hooks/useBlurWindow.tsx'
import { moveWindow, Position } from '@tauri-apps/plugin-positioner'
import {
    getCurrentWindow,
    LogicalSize,
    currentMonitor,
    Effect,
    EffectState,
} from '@tauri-apps/api/window'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Desmos from './components/desmos.tsx'
import { useAppStore } from './hooks/useApp.tsx'
import { exit, relaunch } from '@tauri-apps/plugin-process'
import Layout from './components/ui/layout.tsx'
const queryClient = new QueryClient()

function App() {
    moveWindow(Position.Center)

    // const monitor = currentMonitor().then((monitor) => {
    //     console.log(monitor)
    // })

    const window = getCurrentWindow()
    window.setSize(new LogicalSize(1000, 1000))

    const [theme, setTheme] = useDarkMode()
    const { windowOpenState, setWindowOpenState } = useOpenWindow()
    const ref = useRef<HTMLDivElement>(null)

    const store = useAppStore()

    const { windowBlurred, setWindowBlurred } = UseBlurWindow()

    disableRefresh()
    disableCtrlF()

    async function toggleBlur() {
        console.log('Toggling blur')
        setWindowBlurred(!windowBlurred)
        // await relaunch()
    }
    // debug("search from app.tsx: " + store.searchQuery);
    useEffect(() => {
        const handlePointerDown = (e: PointerEvent) => {
            if (e.currentTarget === e.target) {
                debug('Root Clicked')
                setWindowOpenState('closed')
            }
        }
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                // debug("is focused " + store.isSearching);

                // debug("Escape Pressed");
                setWindowOpenState('closed')
            }
        }
        document.addEventListener('keydown', handleEscape)

        ref.current?.parentElement?.addEventListener(
            'pointerdown',
            handlePointerDown
        )
        ref.current?.addEventListener('pointerdown', handlePointerDown)

        window.setEffects({
            effects: [Effect.Blur],
            state: EffectState.Active,
            radius: 10,
            color: '#25ff111e',
        })
        return () => {
            document.removeEventListener('keydown', handleEscape)
            ref.current?.parentElement?.removeEventListener(
                'pointerdown',
                handlePointerDown
            )
            ref.current?.removeEventListener('pointerdown', handlePointerDown)
        }
    }, [])

    return (
        <main
            ref={ref}
            data-root
            // onPointerDown={(e) => {
            // 	if (e.currentTarget === ref.current) {
            // 		debug("Root Clicked");
            // 		// closeWindow();
            // 	}

            // 	closeWindow();
            // }}
            className={`center flex h-full w-full translate-y-1/2 flex-col overflow-y-hidden p-20 drop-shadow-md transition-all duration-500 ${
                windowOpenState === 'opening' || windowOpenState === 'open'
                    ? ' '
                    : 'close-window'
            }`}
        >
            <QueryClientProvider client={queryClient}>
                <Layout />
                <button
                    className="pointer-events-auto bg-red-500"
                    onClick={() =>
                        setTheme((prev) =>
                            prev === 'light' ? 'dark' : 'light'
                        )
                    }
                >
                    Toggle theme
                </button>
                <button
                    className="pointer-events-auto bg-red-500"
                    onClick={toggleBlur}
                >
                    Toggle blur
                </button>
            </QueryClientProvider>
        </main>
    )
}

export default App
