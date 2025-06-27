import { Info, Settings2 } from 'lucide-react'
import DropSelector from './base/DropSelector'
import '../../styles/SettingsBar.css'
import '../../styles/TagList.css'
import { cn } from '@/lib/utils'
import { useContext, useState } from 'react'
import { SettingsContext, useSettings } from './Results/ResultsLayout'
import { TagGroup, Label, TagList, Tag } from 'react-aria-components'
import Tags from './base/Tags'

const SettingBar = ({ className }: { className?: string }) => {
    const { isSettingsOpen, setIsSettingsOpen } = useSettings()

    return (
        <div
            className={cn(
                'settings-bar-container seperator-b transition-[height] duration-250 ease-linear',
                ` ${isSettingsOpen ? 'h-12' : 'h-0'}`,
                className
            )}
            id="settings-bar-container"
        >
            <Tags />
        </div>
    )
}

export default SettingBar
