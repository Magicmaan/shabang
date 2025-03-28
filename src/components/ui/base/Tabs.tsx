import { debug } from '@tauri-apps/plugin-log'
import * as radixTabs from '@radix-ui/react-tabs'
import { useScroll } from 'react-use'
import { useEffect, useInsertionEffect, useLayoutEffect, useRef } from 'react'
const Tabs: React.FC<{
    defaultValue: string
    children: React.ReactNode
    className?: string
    value?: string
    onValueChange?: (value: string) => void
}> = ({
    defaultValue = 'default',
    children,
    className,
    value,
    onValueChange,
}) => {
    return (
        <radixTabs.Root
            className={`group/tabs flex flex-col items-start justify-start transition-all duration-500 ${className} `}
            defaultValue={defaultValue}
            value={value}
            onValueChange={onValueChange}
        >
            {children}
        </radixTabs.Root>
    )
}

const TabList: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <>
            <radixTabs.List className="flex w-full flex-row p-1">
                {children}
            </radixTabs.List>
        </>
    )
}

const TabTriggers: React.FC<{ value: string; children: React.ReactNode }> = ({
    value,
    children,
}) => {
    return (
        <>
            <radixTabs.Trigger
                value={value}
                className="text-text hover:bg-selected tab flex w-auto flex-row items-center justify-evenly gap-1 rounded-sm border-white/10 px-2 py-0.5 pr-4 text-center aria-selected:border-b-2"
            >
                {children}
            </radixTabs.Trigger>
            <div className="bg-text mx-1 my-auto h-5 w-0.5 opacity-25 last-of-type:hidden" />
        </>
    )
}

const TabContent: React.FC<{
    value: string
    children: React.ReactNode
    className?: string
}> = ({ value, className, children }) => {
    return (
        <radixTabs.Content
            value={value}
            className={`bg-primary scrollbar fade-bottom h-full w-full overflow-scroll overflow-x-hidden p-0.5`}
        >
            {children}
        </radixTabs.Content>
    )
}

export { Tabs, TabTriggers, TabContent, TabList }
