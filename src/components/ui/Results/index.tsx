import { debug } from '@tauri-apps/plugin-log'
import { useDebounce, useThrottle, useThrottleFn, useTimeout } from 'react-use'
import { createSearchSlice } from '@/hooks/search/useSearch'
import Panel from '@/components/ui/base/Panel'
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import SettingBar from '../SettingBar'
// import {
//     TabContent,
//     TabList,
//     Tabs,
//     TabTriggers,
// } from '@/components/ui/base/Tabs'
import {
    ApplicationData,
    ControlPanelData,
    EverythingError,
    EverythingErrorName,
    EverythingData,
    searchResults,
} from '@/types/searchTypes'
import { ChevronDown, ChevronUp, Frown, Info } from 'lucide-react'

import { useAppStore } from '@/hooks/useApp'

import '../../../styles/Results.css'

import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import {
    Tabs,
    TabList,
    Tab,
    TabPanel,
    Collection,
    Key,
    ListBox,
    ListBoxItem,
    ToggleButton,
} from 'react-aria-components'
import { search } from '@/backend/command'
import { useSettings } from './ResultsLayout'

const ResultsContainer = ({
    // setIsSettingsOpen,
    className,
}: {
    // setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>
    className?: string
}) => {
    const ref = useRef<HTMLDivElement>(null)
    const { isSettingsOpen, setIsSettingsOpen } = useSettings()

    const [selectedTab, setSelectedTab] = useState<Key>(1)

    let searchType = useAppStore((state) => state.search.searchType)
    let searchResult = useAppStore((state) => state.search.searchResults)

    const [rect, setRect] = useState<DOMRect | null>(new DOMRect())
    const [selectedKey, setSelectedKey] = useState<Key>(1)
    const lastChange = useRef(new Date().getTime())

    const throttled = useCallback(
        (e: Key) => {
            const time = new Date().getTime()
            if (time - lastChange.current > 250) {
                setSelectedKey(e)
                lastChange.current = time
            }
        },
        [setSelectedKey]
    )
    useEffect(() => {
        const tabSelector = document.getElementById('tab-selector-indicator')
        // Look for the selected tab using the react-aria data attribute
        const tab = document.querySelector(
            `[data-key="${selectedKey}"][role="tab"]`
        )
        if (tab && tabSelector) {
            const rect = tab.getBoundingClientRect()
            console.log('Tab rect:', rect)

            setRect(rect)
            console.log('Tab left position:', rect.x)
        } else {
            if (!tab) {
                console.error('Tab not found for key:', selectedKey)
            }
            if (!tabSelector) {
                console.error('Tab selector not found')
            }
        }
    }, [selectedKey])
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.ctrlKey && tabs.length > 0) {
            let newKey = selectedKey
            if (event.key === 'ArrowLeft') {
                if (selectedKey === 1) {
                    newKey = tabs.length
                } else {
                    newKey = (selectedKey as number) - 1
                }
                event.preventDefault()
            } else if (event.key === 'ArrowRight') {
                if (selectedKey === tabs.length) {
                    newKey = 1
                } else {
                    newKey = (selectedKey as number) + 1
                }
                event.preventDefault()
            }

            if (newKey !== selectedKey) {
                throttled(newKey)
            }
        }
    }
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [selectedKey, setSelectedKey])

    const tabs = (() => {
        if (searchResult instanceof EverythingError) {
            return [
                {
                    id: 1,
                    title: 'files',
                    content: (
                        <ListBox aria-label="File search results">
                            <ListBoxItem key="error-files">
                                nothing G
                            </ListBoxItem>
                        </ListBox>
                    ),
                    length: 0,
                },
                {
                    id: 2,
                    title: 'apps',
                    content: (
                        <ListBox aria-label="Application search results">
                            <ListBoxItem key="error-apps">
                                No apps available
                            </ListBoxItem>
                        </ListBox>
                    ),
                    length: 0,
                },
                {
                    id: 3,
                    title: 'settings',
                    content: (
                        <ListBox aria-label="Settings search results">
                            <ListBoxItem key="error-settings">
                                No settings available
                            </ListBoxItem>
                        </ListBox>
                    ),
                    length: 0,
                },
                {
                    id: 4,
                    title: 'calculator',
                    content: (
                        <ListBox aria-label="Calculator results">
                            <ListBoxItem key="error-calculator">
                                Calculator unavailable
                            </ListBoxItem>
                        </ListBox>
                    ),
                    length: 0,
                },
            ]
        }

        // Process search results
        const processedTabs = Object.entries(searchResult).map(
            ([key, value], index) => {
                if (Array.isArray(value)) {
                    return {
                        id: index + 1,
                        title: key,
                        content: (
                            <ListBox aria-label={`${key} search results`}>
                                {value.map((item: any, itemIndex: number) => (
                                    <ListBoxItem key={itemIndex}>
                                        {item.readable_name ||
                                            'No name available'}
                                    </ListBoxItem>
                                ))}
                            </ListBox>
                        ),
                        length: value.length,
                    }
                } else {
                    return {
                        id: index + 1,
                        title: key,
                        content: (
                            <ListBox aria-label={`${key} search results`}>
                                <ListBoxItem key={key}>
                                    No results found
                                </ListBoxItem>
                            </ListBox>
                        ),
                        length: 0,
                    }
                }
            }
        )

        const fallbackTabs = Object.entries(searchResult).map(
            ([key, value], index) => {
                console.log('key: ', key, 'value: ', value)
                return {
                    id: index + 1,
                    title: key,
                    content: (
                        <ListBox aria-label={`${key} search results`}>
                            <ListBoxItem key={key}>
                                {'No results for ' + key}
                            </ListBoxItem>
                        </ListBox>
                    ),
                    length: 0,
                }
            }
        )

        // Return default tabs if no processed tabs
        return processedTabs.length > 0 ? processedTabs : fallbackTabs
    })()

    // const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    return (
        <Tabs
            onSelectionChange={throttled}
            selectedKey={selectedKey}
            className={cn(className, 'react-aria-Tabs')}
        >
            <div className="seperator-b flex justify-between">
                <TabList aria-label="Search Tabs" items={tabs}>
                    {(item) => (
                        <Tab>
                            {item.title}
                            <div
                                className="text-text-muted flex aspect-square h-full items-center justify-center rounded-full bg-black/10 p-1 text-xs shadow-black drop-shadow-2xl"
                                title={`${item.length} results`}
                            >
                                {item.length}
                            </div>
                        </Tab>
                    )}
                </TabList>
                <ToggleButton
                    // aria-expanded={isSettingsOpen}
                    // isSelected={isSettingsOpen}
                    onChange={setIsSettingsOpen}
                    aria-label={'Toggle settings bar'}
                    id="options-button"
                    className="relative left-0"
                    aria-controls="settings-bar-container"
                >
                    <ChevronDown
                        className={`h-6 transition-[rotate] duration-250 ease-linear ${isSettingsOpen ? 'rotate-180' : ''}`}
                    />
                </ToggleButton>
                <div
                    id="tab-selector-indicator"
                    className="pointer-events-none absolute z-10 flex h-full flex-col items-center justify-end p-1 py-1"
                    style={{
                        left: `${rect?.left}px`,
                        width: `${rect?.width}px`,
                        height: `${rect?.height}px`,
                        top: `${rect?.top}px`,
                        transition:
                            'left 500ms cubic-bezier(.46,-0.25,0,1.24), width 100ms cubic-bezier(.46,-0.25,0,1.24)',
                    }}
                >
                    <div className="bg-accent relative top-1 h-[4px] w-[75%] rounded opacity-50" />
                </div>
            </div>

            <Collection items={tabs}>
                {(item) => <TabPanel>{item.content}</TabPanel>}
            </Collection>
        </Tabs>
    )
}

export default ResultsContainer
