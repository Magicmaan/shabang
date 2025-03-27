import * as math from 'mathjs'
import { searchTypes } from '../../types/searchTypes'
import { bangs, getBang } from './Bangs'

const isValidMath = (query: string): boolean => {
    try {
        // eslint-disable-next-line no-eval
        var result = math.evaluate(query)
        if (
            result === undefined ||
            result === null ||
            isNaN(result) ||
            !isFinite(result) ||
            result === ''
        ) {
            return false
        }
        return true
    } catch (e) {
        return false
    }
}

// get search type from query
export const getSearchType = (
    query: string
): { searchType: searchTypes; query: string } => {
    let searchType: searchTypes | undefined

    let modifiedQuery = query

    // prefer bangs over other search types

    if (isValidMath(query)) {
        searchType = searchTypes.calculator
    } else {
        if (
            query.endsWith('+') ||
            query.endsWith('-') ||
            query.endsWith('*') ||
            query.endsWith('/') ||
            query.endsWith('=')
        ) {
            searchType = searchTypes.calculator
        } else {
            searchType = searchTypes.file
        }
    }

    return { searchType, query: modifiedQuery }
}
