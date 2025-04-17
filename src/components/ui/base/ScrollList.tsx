import { cn } from '@/lib/utils'
import { e } from 'mathjs'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useUnmount } from 'react-use'
import * as React from 'react'

interface ScrollListProps extends React.HTMLAttributes<HTMLUListElement> {
    selected: number | null
    setSelected?: React.Dispatch<React.SetStateAction<number | undefined>>
    ref?: React.RefObject<HTMLUListElement>
}

const ScrollList = ({
    ref: listRef,
    selected,
    setSelected,
    className,
    ...props
}: ScrollListProps) => {
    // const ref = useRef<HTMLUListElement>(props.ref)
    if (!listRef) {
        listRef = useRef<HTMLUListElement>(null)
    }

    const listElements = useMemo(() => {
        if (!listRef.current) return []
        const elements = listRef.current.querySelectorAll('li')
        return elements as NodeListOf<HTMLLIElement>
    }, [props.children])

    const getSelectedElement = (index: number) => {
        if (!listRef.current) return null
        const selectedElement = listRef.current.querySelector(
            `[data-index="${index}"]`
        )
        return selectedElement as HTMLLIElement | null
    }

    // const observer = new IntersectionObserver(ScrollTo)

    const ref = useRef<HTMLDivElement>(null)
    const isArrowHeld = useRef(false)
    const isWheelScrolling = useRef(false)
    const isMousePrompted = useRef(false)

    let increment = 0.25
    const onKeyDown = (e: KeyboardEvent) => {
        if (!setSelected) return

        if (isArrowHeld.current) {
            increment = 0.25
        } else {
            increment = 1
            isArrowHeld.current = true
        }

        //TODO: scroll to selected key and make feel better
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            isWheelScrolling.current = false

            console.log('scrolling down', selected, increment)
            setSelected((prev) => {
                return prev ? prev + increment : 1
            })
        }
        if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            isWheelScrolling.current = false

            console.log('scrolling up', selected, increment)
            setSelected((prev) => {
                return prev ? prev - increment : 1
            })
        }
    }
    const onKeyUp = (e: KeyboardEvent) => {
        isArrowHeld.current = false
    }

    useEffect(() => {
        if (!setSelected) return
        if (!listRef.current) return
        // arrow key movement
        // short press = 0.25
        // long press = 1

        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)
        return () => {
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
        }
    }, [])

    useEffect(() => {
        if (!selected) return
        if (isMousePrompted.current) {
            isMousePrompted.current = false
            return
        }
        if (!setSelected) return
        const elem = getSelectedElement(selected)
        console.log('elem', elem)
        elem?.scrollIntoView({
            behavior: 'smooth',
            inline: 'end',
        })
    }, [selected])

    const onUserSelect = (e: MouseEvent) => {
        const target = e.currentTarget as HTMLLIElement
        console.log('onUserSelect', target.dataset.index)

        if (!setSelected) return
        if (!target.dataset.index) return
        const index = parseInt(target.dataset.index, 10)
        if (isNaN(index)) return

        isMousePrompted.current = true
        setSelected(index + 1)
    }
    console.log('listElements', props.children)

    // link li elements to the selected state
    useEffect(() => {
        if (!listRef.current) return

        const elements = Array.from(listRef.current.children)

        if (!elements) return

        elements.forEach((el, index) => {
            // @ts-ignore
            el.dataset.index = index.toString()
            // @ts-ignore
            el.tabIndex = index
            el.addEventListener('mousedown', onUserSelect as EventListener)
        })

        return () => {
            elements.forEach((el, index) => {
                el.removeAttribute('data-index')
                el.removeAttribute('tabindex')
                el.removeEventListener('mouse', onUserSelect as EventListener)
            })
        }
    }, [props.children])

    return (
        <div
            ref={ref}
            className={cn(
                'max-h-auto w-full overflow-y-scroll ease-in-out aria-hidden:opacity-0',
                className
            )}
        >
            <ul ref={listRef} {...props}>
                {props.children}
            </ul>
        </div>
    )
}

export default ScrollList
