import { EllipsisVertical } from 'lucide-react'
import React from 'react'
import { createSearchSlice } from '../../../hooks/search/useSearch'
import { debug } from '@tauri-apps/plugin-log'

import { toRelativeStr } from '../../../util/time'
import { useAppStore } from '@/hooks/useApp'
import Desmos from '@/components/desmos'

interface PreviousEquationProps {
    query: string
}

const PreviousEquation: React.FC<PreviousEquationProps> = ({ query }) => {
    const timestamp = new Date(1740689723000) // Mock value for testing

    const relativeTime = toRelativeStr(timestamp)
    const date = timestamp.toUTCString()

    return (
        <div className="bg-secondary previous-equation flex h-12 w-full flex-row items-start justify-between rounded-md p-2">
            <div className="flex h-full w-auto flex-row items-center justify-center gap-1 bg-red-500">
                <p className="text-text center h-full w-full">{query}</p>
            </div>

            <p title={date} className="text-text text-sm">
                {relativeTime}
            </p>
            <div className="flex aspect-square w-5 items-center justify-center">
                <EllipsisVertical />
            </div>
        </div>
    )
}

export const CalculatorResult = () => {
    const previousQueries = useAppStore((state) => state.search.previousQueries)
        .filter((query) => query.searchType === 'calculator')
        .map((query) => query.query)

    // useEffect(() => {
    // 	//debug("search difference: " + searchDifference);
    // }, [searchQuery]);
    // debug("Results: " + results[0].query + " with type " + resultType);

    debug('Previous Queries: ' + previousQueries)
    return (
        <div className="equation-list flex h-auto min-h-64 w-full flex-col items-start justify-start gap-1 p-1">
            {previousQueries.map((query, index) => (
                <PreviousEquation query={query} index={index} />
            ))}
            <PreviousEquation query={'51 + 9 = 60'} />
            <PreviousEquation query={'21 / 2 = 60'} />
            <PreviousEquation query={'21 / 2 = 60'} />

            <Desmos />
        </div>
    )
}
