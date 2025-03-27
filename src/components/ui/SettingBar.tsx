import { Info, Settings2 } from 'lucide-react'
import DropSelector from './base/DropSelector'
import Button from './base/button'
import { useEffect } from 'react'
import { gsap } from 'gsap'

const SettingBar = ({ visible }: { visible: boolean }) => {
    useEffect(() => {
        const settingsButton = document.querySelector('#search-settings-button')
        const settingsDivider = document.querySelector('#search-tabs-h-divider')

        const tl = gsap.timeline({ paused: true })
        tl.fromTo(
            settingsDivider,
            { opacity: 0, y: -10 },
            { opacity: 0.25, y: 0, duration: 0.2 }
        )

        if (visible) {
            tl.play()
        } else {
            tl.restart()
            tl.pause()
        }
    }, [visible])

    return (
        <div
            aria-expanded={visible}
            aria-hidden={!visible}
            className="fade-bottom relative flex h-0 max-h-0 min-h-0 w-full flex-row items-center justify-start overflow-clip opacity-0 transition-all delay-75 ease-out aria-expanded:min-h-12 aria-expanded:p-1 aria-expanded:opacity-100 aria-hidden:pointer-events-none"
        >
            <DropSelector
                initialLabel="whitelist"
                options={[
                    { value: 'files', label: 'Files' },
                    { value: 'apps', label: 'Apps' },
                    { value: 'settings', label: 'Settings' },
                ]}
            />
            <div className="flex w-full flex-grow" />
            <Button shape="circle" size="small" border="svg">
                <Info className="group group-hover:text-accent" />
            </Button>
        </div>
    )
}

export default SettingBar
