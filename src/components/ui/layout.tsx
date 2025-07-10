import { cva } from 'class-variance-authority'
import Widget from './base/Widget'
import QuickWidgets from './QuickWidgets'
import ResultsContainer from './Results'
import SearchBar from './SearchBar'
import SettingBar from './SettingBar'
import ResultsLayout from './Results/ResultsLayout'

const LayoutStyle = cva(
    'pointer-events-none flex h-full w-full origin-top flex-row items-stretch justify-center gap-2.5',
    {
        variants: {
            variant: {
                default: 'gap-2.5',
                small: 'gap-1.5',
                large: 'gap-4',
            },

            verticalGap: {
                default: '',
                small: '',
                none: 'gap-0',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
)

interface LayoutProps {
    children?: React.ReactNode

    searchBarConnected?: boolean
    searchBarVariant?: 'default' | 'small' | 'large'
}

const Layout = ({
    children,
    searchBarConnected,
    searchBarVariant,
}: LayoutProps) => {
    return (
        <div className="root-layout group/layout layout-gap">
            {/* Left column */}

            <QuickWidgets />

            {/* Middle column */}

            <SearchBar className="group/layout rounded-full group-[.layout-no-gap]/layout:rounded-b-none" />
            <ResultsLayout />
        </div>
    )
}

export default Layout
