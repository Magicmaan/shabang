import { currentMonitor, Monitor } from '@tauri-apps/api/window'
import { Position } from '@tauri-apps/plugin-positioner'
import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

async function useWindow() {
    const monitor = useQuery({ queryKey: ['monitor'], queryFn: currentMonitor })

    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
    const [windowPosition, setWindowPosition] = useState<Position>(
        Position.Center
    )
}
