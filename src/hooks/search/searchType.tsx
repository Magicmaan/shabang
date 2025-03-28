import * as math from 'mathjs'
import { searchTypes } from '../../types/searchTypes'
import { bangs, getBang } from './Bangs'

// get search type from query
export const identifySearchType = (
    query: string
): { searchType: searchTypes; query: string } => {
    // let searchType: searchTypes | undefined

    // prefer bangs over other search types

    const searchType = 'file'

    return { searchType, query: query }
}
