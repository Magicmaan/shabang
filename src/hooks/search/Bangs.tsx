import { open } from '@/backend/command'
import { searchTypes } from '@/types/searchTypes'
import { invoke } from '@tauri-apps/api/core'
import { re } from 'mathjs'
import { useAppStore } from '../useApp'

// can define a transformer that transforms query before using as usual
// i.e. "!google" bang will transform query into `https://www.google.com/search?q=${query}`
// i.e. "!file" bang will transform query into `file: ${query}`

interface queryTransformer {
    (): string
}

// can define a action that will be executed
// i.e. "!calculator" will return calculator result
// i.e. "!open" will open path typed for example

interface queryAction {
    (): boolean
}

type bangType = 'web' | 'file' | 'command' | 'calculator'

export interface bangActionSerialised {
    searchType: searchTypes
    type: bangType
    action?: string
    transformer?: string
    alias: string
    shortcut?: string
    description?: string
}

export interface bangAction {
    searchType: searchTypes
    type: bangType
    action?: queryAction
    transformer?: queryTransformer
    alias: string
    shortcut?: string
    description?: string
}

const defaultWebAction = (query: string, action: string) => {
    const url = action.replace('${query}', query)
    open({
        path: url,
        mode: 'web',
    })
    return true
}

const defaultFileTransformer = (query: string, transformer: string) => {
    return transformer.replace('${query}', query)
}

export const bangSelector = '!'
export const getBang = (query: string): [bangAction, string] | null => {
    const settings = useAppStore.getState().settings
    const bangs = settings.bangs
    console.log('bang settings: ', settings)

    const bangSelector = settings.bangSelector
    console.log('bangSelector: ', bangSelector)
    // split query into words
    const words = query.split(' ')
    // find the first word that starts with bangSelector
    const bangIdentifier = words.find((word) => bangSelector.includes(word[0]))

    if (!bangIdentifier) return null
    // get the keyword after the bangSelector
    const kword = bangIdentifier?.slice(1)
    console.log('found bang: ', kword)

    // try to get bang first on alias
    let bang = bangs[kword]

    // if not found, look for shortcut
    if (!bang) {
        for (let key in bangs) {
            if (bangs[key].shortcut === kword) {
                bang = bangs[key]
                break
            }
        }
    }

    if (bang) {
        const bangAction = bang
        let cutQuery = query.replace(bangIdentifier, '')
        cutQuery = cutQuery.trim()

        console.log('cut query:"', cutQuery, '"')

        // return the bang action and the query
        // returns a nested function that embeds query
        // @ts-expect-error
        let action = {
            ...bangAction,
        } as bangAction

        switch (bangAction.type) {
            case 'web':
                action.action = () =>
                    defaultWebAction(cutQuery, bangAction.action ?? '')
                break
            case 'file':
                action.transformer = () =>
                    defaultFileTransformer(
                        cutQuery,
                        bangAction.transformer ?? ''
                    )

                cutQuery = action.transformer()
                console.log('query transformer: ', bangAction.transformer)
                console.log('Transformed query: ', cutQuery)
                break

            // no valid transformer etc.
            default:
                action.action = () => false
                action.transformer = () => cutQuery
        }

        return [action, cutQuery]
    }

    return null
}
