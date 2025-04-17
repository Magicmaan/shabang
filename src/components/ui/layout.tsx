import { cva } from 'class-variance-authority'
import Widget from './base/Widget'
import QuickWidgets from './QuickWidgets'
import ResultsContainer from './Results'
import SearchBar from './SearchBar'

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
        <div className="pointer-events-none flex h-full w-full origin-top flex-row items-stretch justify-center gap-2.5">
            <div className="flex h-full w-1/3 items-start justify-end">
                <div className="flex h-full w-auto flex-col items-center justify-between gap-2.5">
                    <QuickWidgets />
                </div>
            </div>
            <div className="pointer-events-auto flex h-max w-1/3 min-w-[36rem] flex-col items-stretch justify-stretch">
                <SearchBar />
                <ResultsContainer />
            </div>

            <div className="h-full w-1/3">g</div>
        </div>
    )
}

export default Layout
