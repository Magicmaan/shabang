import { useEffect, useRef } from 'react'
import {
    Expression,
    GraphingCalculator,
    useHelperExpression,
} from 'desmos-react'

import D from 'desmos-react'

/// <reference types="desmos" />

const Desmos = () => {
    const ref = useRef<Desmos.Calculator>(null)

    useEffect(() => {
        if (!ref.current) return

        const calculator = ref.current

        calculator.settings.keypad = false
        calculator.updateSettings({
            expressions: false,
            zoomButtons: false,
            settingsMenu: false,
        })
    }, [])

    return (
        <div className="h-auto w-auto bg-red-500 p-1">
            <GraphingCalculator
                ref={ref}
                attributes={{ className: 'w-96 h-96 bg-red-200 p-1' }}
                fontSize={12}
                keypad
                projectorMode
            >
                <Expression id="slider" latex="a=3" />
                <Expression id="line" latex="y=a*x" />
            </GraphingCalculator>
        </div>
    )
}

export default Desmos
