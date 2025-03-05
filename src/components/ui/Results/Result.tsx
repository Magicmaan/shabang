import { AppWindow, Settings, File, MonitorCog } from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import { useCallback, useMemo, useRef } from 'react'
import { useSearchStore } from '../../../hooks/search/useSearch'
import { openPath } from '@tauri-apps/plugin-opener'
import { invoke } from '@tauri-apps/api/core'
import { twMerge } from 'tailwind-merge'
import {
    ApplicationResult,
    ControlPanelResult,
    EverythingResult,
} from '@/types/searchTypes'

const fileIcons: { [key: string]: LucideIcon } = {
    default: File,
    exe: AppWindow,
    lnk: AppWindow,
    setting: MonitorCog,
}

const fileShortcutAlias: { [key: string]: string } = {
    'AppData\\Local': '%LOCALAPPDATA%',
    AppData: '%APPDATA%',
    'Program Files': '%PROGRAMFILES%',
    'Program Files (x86)': '%PROGRAMFILES(X86)%',
    Windows: '%SYSTEMROOT%',
    UserProfile: '%USERPROFILE%',
}

type ResultProps = {
    mainText: string
    subText: string
    mainTextRight?: string
    subTextRight?: string

    Icon?: LucideIcon
    IconProps?: React.SVGProps<SVGSVGElement>
    type: 'file' | 'setting' | 'app'
    selected?: number
    key: number
    data?: {
        path?: string
    }
}

const Result = ({
    mainText,
    subText,
    mainTextRight,
    subTextRight,
    Icon,
    IconProps,
    type,
    data,
    className,
    selected,
    key,
}: ResultProps & { className?: string }) => {
    if (!Icon) Icon = fileIcons.default
    const ref = useRef<HTMLDivElement>(null)
    const open = useSearchStore((state) => state.openFile)

    return (
        <div
            key={key}
            aria-selected={selected === key}
            // prettier-ignore
            className={twMerge(
            `group flex h-14 w-full 
            flex-row overflow-hidden rounded-md 
            bg-black/10 transition-all 
            duration-300 hover:cursor-pointer`,
            className
            )}
        >
            <div
                aria-selected={selected === key}
                className="group group-hover:bg-selected focus:bg-selected aria-selected:bg-selected flex h-full w-full flex-row gap-2 overflow-hidden p-2 transition-colors duration-300 hover:cursor-pointer"
                ref={ref}
                onPointerDown={(e) => {
                    if (!data?.path) return
                    open(data?.path, false)
                    e.currentTarget.focus()
                }}
            >
                <div className="flex aspect-square h-10 items-center justify-center rounded-xl bg-white/5 p-1">
                    <Icon
                        absoluteStrokeWidth
                        strokeWidth={2}
                        className="stroke-text-secondary aspect-square h-full w-full"
                        {...IconProps}
                    />
                </div>
                <div
                    className="flex h-auto w-full flex-col overflow-hidden text-wrap"
                    title={'test'}
                >
                    <p className="text-primary fade-text-right text-nowrap">
                        {mainText}
                    </p>

                    <div className="flex w-auto max-w-full flex-row gap-2 pl-2">
                        <p className="text-secondary fade-text-right w-full text-xs text-nowrap">
                            {subText}
                        </p>
                    </div>
                </div>
            </div>
            <div className="dark: flex h-full w-0 flex-col border-black/10 bg-black/5 transition-all delay-300 duration-200 group-hover:w-14 group-hover:border-l-2 dark:border-white/50 dark:bg-white/5">
                + -
            </div>
        </div>
    )
}

export const FileResult = ({
    result,
    selected,
    key,
}: {
    result: ApplicationResult
    selected: number
    key: number
}) => {
    const filePath = useMemo(() => {
        let filePath = result.path.split('\\').slice(0, -1).join('\\')

        for (const [key, value] of Object.entries(fileShortcutAlias)) {
            if (filePath.includes(key)) {
                filePath = filePath.split(key).pop() || ''
                filePath = value + filePath
            }
        }

        filePath = filePath.replace(/\\/g, ' / ')
        return filePath
    }, [result])

    return (
        <Result
            key={key}
            selected={selected}
            mainText={result.readable_name}
            subText={filePath}
            data={{
                path: result.path,
            }}
            type="file"
            className={selected == key ? 'bg-selected' : ''}
        />
    )
}

export const SettingResult = ({
    result,
    selected,
    key,
}: {
    result: ApplicationResult
    selected: number
    key: number
}) => {
    return (
        <Result
            key={key}
            selected={selected}
            mainText={result.readable_name}
            subText={'Control Panel'}
            Icon={fileIcons.setting}
            IconProps={{
                strokeWidth: 2,
                className: 'text-sky-300',
            }}
            data={{
                path: result.name,
            }}
            type="setting"
        />
    )
}

export const AppResult = ({
    result,
    selected,
    key,
}: {
    result: ApplicationResult
    selected: number
    key: number
}) => {
    const filePath = useMemo(() => {
        let filePath = result.path.split('\\').slice(0, -1).join('\\')

        for (const [key, value] of Object.entries(fileShortcutAlias)) {
            if (filePath.includes(key)) {
                filePath = filePath.split(key).pop() || ''
                filePath = value + filePath
            }
        }

        filePath = filePath.replace(/\\/g, ' / ')
        return filePath
    }, [result])

    const extension = result.path.split('.').pop() || 'default'

    return (
        <Result
            key={key}
            selected={selected}
            mainText={result.readable_name}
            subText={filePath}
            data={{
                path: result.path,
            }}
            Icon={fileIcons[extension]}
            type="file"
        />
    )
}

export const PlaceHolderResult = () => {
    return (
        <div
            // prettier-ignore
            className={
    `group flex h-14 w-full
    flex-row gap-2 overflow-hidden rounded-md 
    bg-black/10 transition-all 
    duration-1000 relative group-aria-hidden:rotate-x-15 group-aria-hidden:-rotate-y-3 not-[group-aria-hidden]:rotate-x-0 not-[group-aria-hidden]:rotate-y-0 perspective-dramatic `
    }
        >
            <div className="flex h-full w-full animate-pulse flex-row gap-2 p-2">
                <div className="flex aspect-square h-10 items-center justify-center rounded-xl bg-white/5 p-1"></div>
                <div
                    className="-ml-0.5 flex h-auto w-full flex-col overflow-hidden text-wrap"
                    title={'test'}
                >
                    <div className="h-5 w-1/2 rounded-lg bg-white/10" />

                    <div className="flex w-auto max-w-full flex-row gap-2 pt-2 pl-2">
                        <div className="h-3 w-3/4 rounded-lg bg-white/10" />
                    </div>
                </div>
            </div>
        </div>
    )
}
