import {
    AppWindow,
    Settings,
    File,
    MonitorCog,
    Folder,
    FolderClosed,
    Frown,
    Icon,
} from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import { useCallback, useMemo, useRef } from 'react'
import { createSearchSlice } from '../../../hooks/search/useSearch'
import { openPath } from '@tauri-apps/plugin-opener'
import { invoke } from '@tauri-apps/api/core'
import { cn } from '@/lib/utils'
import {
    ApplicationData,
    ControlPanelData,
    EverythingData,
    EverythingError,
} from '@/types/searchTypes'
import { debug } from '@tauri-apps/plugin-log'
import { extname } from '@tauri-apps/api/path'

import { fileIcons } from '@/constants/fileIcons'
import { fileShortcutAlias } from '@/constants/files'
import { open } from '@/backend/command'
import { bangAction } from '@/hooks/search/Bangs'
import { useAppStore } from '@/hooks/useApp'
import { cva } from 'class-variance-authority'

const ResultStyles = cva(
    `group flex w-full flex-row overflow-hidden rounded-md  transition-all duration-300 hover:cursor-pointer
    `,
    {
        variants: {
            type: {
                default: 'bg-li-25 h-14 ',
                bang: 'h-10 bg-li-75 dark:bg-li-25 border-2 border-global-li-10',
            },
            keybind: {
                true: '[&_.result-keybind]:inline',
                false: '[&_.result-keybind]:hidden',
            },
            icon: {
                small: '[&_svg]:h-8 [&>svg]:w-8 [&_.icon-container]:rounded-md',
                medium: '[&_svg]:h-10 [&>svg]:w-10 [&_.icon-container]:rounded-lg',
                large: '[&_svg]:h-12 [&>svg]:w-12 [&_.icon-container]:rounded-lg',
            },
        },
        defaultVariants: {
            type: 'default',
            keybind: true,
            icon: 'medium',
        },
    }
)

export const ResultsPlaceholder = ({ active }: { active: boolean }) => {
    return (
        <div
            aria-hidden={!active}
            aria-disabled={!active}
            className={`scrollbar group bg-primary border-primary absolute z-10 h-auto w-full overflow-y-scroll pb-2 transition-all duration-500 ease-in-out aria-hidden:pointer-events-none aria-hidden:opacity-0`}
        >
            <ul>
                {[...Array(5)].map((_, i) => {
                    return (
                        <li index={i}>
                            <PlaceHolderResult index={i} />
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

export const ResultsError = ({ error }: { error: EverythingError }) => {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2">
            <Frown size={64} />
            <h1 className="text-text text-xl">{error.name}</h1>
            <p className="text-text">{error.message}</p>
        </div>
    )
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
    index: number
    data?: {
        path?: string
    }
    className?: string
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
    index,
}: ResultProps) => {
    if (!Icon) Icon = fileIcons.default
    const ref = useRef<HTMLDivElement>(null)

    return (
        <>
            <div
                index={index}
                aria-selected={selected === index}
                data-type={type}
                // prettier-ignore
                className={cn(
                    ResultStyles(),className
                        )}
            >
                <div
                    aria-selected={Math.floor(selected || 1) === index}
                    className="group group-hover:bg-selected focus:bg-selected aria-selected:bg-selected flex h-full w-full flex-row gap-2 overflow-hidden p-2 transition-colors duration-300 hover:cursor-pointer"
                    ref={ref}
                    onPointerDown={(e) => {
                        if (!data?.path) return
                        if (e.button !== 0) return
                        open(data?.path)
                        e.currentTarget.focus()
                    }}
                >
                    <div className="bg-da-10 icon-container flex aspect-square h-auto w-auto items-center justify-center p-1">
                        <Icon
                            absoluteStrokeWidth
                            strokeWidth={2}
                            className="stroke-text-secondary aspect-square"
                            {...IconProps}
                        />
                    </div>
                    <div
                        className="flex h-auto w-full flex-col overflow-hidden text-wrap"
                        title={mainText}
                    >
                        <p className="text-primary fade-right text-nowrap">
                            {mainText}
                        </p>

                        <div
                            className="flex w-auto max-w-full flex-row gap-2 pl-2"
                            title={subText}
                        >
                            <p className="text-secondary fade-right w-3/4 text-xs text-nowrap">
                                {subText}
                            </p>
                        </div>
                    </div>
                    <p className="result-keybind text-secondary text-sm text-nowrap">
                        <kbd>Alt</kbd>
                        {' + '}
                        <kbd>{index}</kbd>
                    </p>
                </div>
                <div className="flex h-full w-0 flex-col border-white/10 bg-black/5 transition-all delay-300 duration-200 group-hover:w-14 group-hover:border-l-2 dark:border-white/50 dark:bg-white/5">
                    + -
                </div>
            </div>
            <div className="fade-x mx-auto h-0.5 w-9/10 bg-black/10 dark:bg-black/20" />
        </>
    )
}

export const FileResult = ({
    result,
    selected,
    index,
}: {
    result: ApplicationData
    selected: number
    index: number
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

    const icon =
        fileIcons[result.path.split('.').pop()?.toLowerCase() || 'default']
    return (
        <Result
            index={index}
            selected={selected}
            mainText={result.readable_name}
            subText={filePath}
            Icon={icon}
            data={{
                path: result.path,
            }}
            type="file"
        />
    )
}

export const SettingResult = ({
    result,
    selected,
    index, // Add index prop
}: {
    result: ControlPanelData
    selected: number
    index: number // Add index type
}) => {
    debug('setting index: ' + index)
    return (
        <Result
            data-slot="context-menu-trigger"
            index={index}
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
    index,
}: {
    result: ApplicationData
    selected: number
    index: number
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
            index={index}
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

export const BangResult = ({
    bang,
    selected,
    index,
}: {
    bang: bangAction
    selected: number
    index: number
}) => {
    const { searchType, transformer, action, alias, description } = bang
    const ref = useRef<HTMLDivElement>(null)
    const type = 'bang'

    let query: string | null = useAppStore((state) => state.search.searchQuery)
    const bangSelector = useAppStore((state) => state.settings.bangSelector)

    return (
        <>
            <div
                index={index}
                aria-selected={selected === index}
                data-type={type}
                // prettier-ignore
                className=
                    {cn(ResultStyles({type:"bang", keybind:false, icon:"small"}))}
            >
                <div
                    aria-selected={Math.floor(selected || 1) === index}
                    className="group group-hover:bg-selected focus:bg-selected aria-selected:bg-selected flex h-full w-full flex-row gap-2 overflow-hidden p-2 transition-colors duration-300 hover:cursor-pointer"
                    ref={ref}
                    onPointerDown={(e) => {
                        if (action) {
                            action()
                        }
                    }}
                >
                    <div className="bg-da-10 icon-container flex aspect-square h-auto w-auto items-center justify-center p-1">
                        <fileIcons.google className="stroke-text-secondary aspect-square" />
                    </div>
                    <div
                        className="flex h-auto w-full flex-row overflow-hidden text-wrap"
                        title={bang.alias}
                    >
                        <p className="text-primary text-sm">
                            <strong>
                                {bangSelector[0]}
                                {bang.alias}
                            </strong>{' '}
                            {` / ${bang.description}`}
                            {bang.action &&
                                query?.length > 0 &&
                                `/ ${query} `}{' '}
                        </p>
                    </div>
                    <p className="result-keybind text-secondary text-sm text-nowrap">
                        <kbd>Alt</kbd>
                        {' + '}
                        <kbd>{index}</kbd>
                    </p>
                </div>
                <div className="flex h-full w-0 flex-col border-white/10 bg-black/5 transition-all delay-300 duration-200 group-hover:w-14 group-hover:border-l-2 dark:border-white/50 dark:bg-white/5">
                    + -
                </div>
            </div>
            <div className="fade-x mx-auto h-0.5 w-9/10 bg-black/10 dark:bg-black/20" />
        </>
    )
}
