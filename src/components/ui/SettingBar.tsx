import { Info, Settings2 } from 'lucide-react'
import '../../styles/SettingsBar.css'
import '../../styles/TagList.css'
import { cn } from '@/lib/utils'
import { useSettings } from './Results/ResultsLayout'
import Tags from './base/Tags'

const SettingBar = ({ className }: { className?: string }) => {
    const { isSettingsOpen, setIsSettingsOpen } = useSettings()

    return (
        <div
            className={cn(
                'settings-bar-container seperator-b transition-[height,opacity] duration-250 ease-linear',
                ` ${isSettingsOpen ? 'h-10 opacity-100' : 'h-0 opacity-0'}`,
                className
            )}
            id="settings-bar-container"
        >
            <Tags />
        </div>
    )
}

export default SettingBar
