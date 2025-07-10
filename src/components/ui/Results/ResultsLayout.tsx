import { createContext, ReactNode, useContext, useState } from 'react'
import ResultsContainer from '.'
import SettingBar from '../SettingBar'

interface SettingsContextType {
    isSettingsOpen: boolean
    setIsSettingsOpen: (value: boolean) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(
    undefined
)

export const useSettings = () => {
    const context = useContext(SettingsContext)
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider')
    }
    return context
}

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(true)

    return (
        <SettingsContext.Provider value={{ isSettingsOpen, setIsSettingsOpen }}>
            {children}
        </SettingsContext.Provider>
    )
}
const ResultsLayout = () => {
    const [isSettingsOpen, setIsSettingsOpen] = useState<true | false>(true)

    return (
        <SettingsProvider>
            <div
                style={{ gridArea: 'results' }}
                className="group/results-container radius bg-gradient flex flex-col items-stretch justify-stretch border p-2"
            >
                <SettingBar className="group/layout peer" />

                <ResultsContainer className="group/layout peer h-full" />
            </div>
        </SettingsProvider>
    )
}

export default ResultsLayout
