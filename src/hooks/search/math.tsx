import { MathData, MathType } from '@/types/searchTypes'
import * as math from 'mathjs'

export const getMathComplexity = (query: string): MathType => {
    return 'simple'
}

export const getMath = (query: string): MathData => {
    let result: string = ''

    try {
        result = math.evaluate(query).toString()
    } catch (e) {
        console.log('error evaluating math', e)
    }

    console.log('math match', result)

    return {
        equation: query,
        result: result,
        type: getMathComplexity(query),
    }
}
