import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { debug } from '@tauri-apps/plugin-log'
import { useRef, useState } from 'react'

// listens for open_window and close_window events
export const UseBlurWindow = () => {
    const [windowBlurred, _setWindowBlurred] = useState(false)
    const throttle = useRef(false)
    const throttleWait = 50 // 1 second
    const colour = '#11ff4d94'
    function convertColourToRGBA(
        colour: string
    ): [number, number, number, number] {
        // Assuming the input is a hex colour code like "#RRGGBB" or "#RRGGBBAA"
        if (colour.startsWith('#')) {
            const hex = colour.slice(1)
            if (hex.length === 6) {
                const r = parseInt(hex.slice(0, 2), 16)
                const g = parseInt(hex.slice(2, 4), 16)
                const b = parseInt(hex.slice(4, 6), 16)
                return [r, g, b, 255] // Default alpha to 255
            } else if (hex.length === 8) {
                const r = parseInt(hex.slice(0, 2), 16)
                const g = parseInt(hex.slice(2, 4), 16)
                const b = parseInt(hex.slice(4, 6), 16)
                const a = parseInt(hex.slice(6, 8), 16)
                return [r, g, b, a]
            }
        }
        throw new Error('Invalid colour format. Expected #RRGGBB or #RRGGBBAA.')
    }

    async function getBlur() {
        const blur = await invoke('get_blur', {}).then((res) => res as boolean)
        return blur
    }

    async function setWindowBlurred(blur: boolean) {
        if (blur) {
            invoke('set_blur', {
                blur: true,

                colour: convertColourToRGBA(colour),
                style: 'Acrylic',
            })
        } else {
            invoke('set_blur', {
                blur: false,
                colour: convertColourToRGBA(colour),
                style: 'blur',
            })
        }
        const blurState = await getBlur()
        debug('Setting Blur: ' + blurState)

        _setWindowBlurred(blurState)
    }

    return { windowBlurred, setWindowBlurred }
}
