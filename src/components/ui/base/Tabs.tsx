import { debug } from '@tauri-apps/plugin-log'
import * as radixTabs from '@radix-ui/react-tabs'
const Tabs: React.FC<{
    defaultValue: string
    children: React.ReactNode
    className?: string
}> = ({ defaultValue = 'default', children, className }) => {
    return (
        <radixTabs.Root
            className={`group/tabs flex flex-col items-start justify-start gap-2 transition-all duration-500 ${className} `}
            defaultValue={defaultValue}
        >
            {children}
        </radixTabs.Root>
    )
}

const TabList: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <>
            <radixTabs.List className="flex w-full flex-row p-1 pb-0">
                {children}
            </radixTabs.List>
            <div className="bg-text mx-auto h-0.5 w-99/100 opacity-25" />
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
                className="text-text hover:bg-selected tab flex flex-row items-center justify-start gap-1 rounded-sm border-white/10 px-2 py-0.5 text-center aria-selected:border-b-2"
            >
                {children}
            </radixTabs.Trigger>
            <div className="bg-text my-auto h-5 w-0.5 opacity-25 last-of-type:hidden" />
        </>
    )
}

const TabContent: React.FC<{ value: string; children: React.ReactNode }> = ({
    value,
    children,
}) => {
    return (
        <radixTabs.Content
            value={value}
            className="bg-primary scrollbar h-full w-full overflow-scroll overflow-x-hidden p-0.5"
        >
            {children}
        </radixTabs.Content>
    )
}

export { Tabs, TabTriggers, TabContent, TabList }
