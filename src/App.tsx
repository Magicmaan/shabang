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
} from '@tauri-apps/api/window'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Desmos from './components/desmos.tsx'
import { useAppStore } from './hooks/useApp.tsx'

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
        setWindowBlurred(!windowBlurred)
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
                <div className="pointer-events-none flex h-full w-full origin-top flex-row items-stretch justify-center gap-2.5">
                    <div className="flex h-full w-1/3 items-start justify-end">
                        <div className="flex h-full w-auto flex-col items-center justify-between gap-2.5">
                            <QuickWidgets />
                            <Widget
                                className=""
                                onPointerDown={() =>
                                    setTheme((prev) =>
                                        prev === 'light' ? 'dark' : 'light'
                                    )
                                }
                            >
                                g
                            </Widget>
                        </div>
                    </div>
                    <div className="pointer-events-auto flex h-max w-1/3 min-w-[36rem] flex-col items-stretch justify-stretch gap-2.5">
                        <SearchBar />
                        <ResultsContainer />
                    </div>

                    <div className="h-full w-1/3">g</div>
                </div>
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
            </QueryClientProvider>
        </main>
    )
}

export default App
