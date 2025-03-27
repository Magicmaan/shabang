import React from 'react'
import { cn } from '@/lib/utils'
interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {}

const Divider: React.FC<DividerProps> = (props) => {
    return (
        <div
            {...props}
            className={cn(
                'bg-text mx-auto my-1 h-0.5 w-95/100 rounded-lg opacity-25',
                props.className
            )}
        />
    )
}

export default Divider
