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

    return (
        <main data-root className={`flex h-full w-full`}>
            <QueryClientProvider client={queryClient}>
                <Layout />
            </QueryClientProvider>
        </main>
    )
}

export default App
