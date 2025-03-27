import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonStyles = cva(
    `group flex flew-row gap-2 items-center justify-around pl-2 px-1 py-0.5 transition-color 
     duration-200 ease-out [&>*]:ease-out
    
    
    `, // base class

    {
        variants: {
            size: {
                small: 'min-w-16 max-w-32 w-auto',
                medium: 'min-w-20 max-w-48 w-auto',
                large: 'button-large',
            },
            color: {
                primary: 'bg-transparent [&>svg]:text-text text-text',
                secondary:
                    'bg-transparent [&>svg]:text-text-secondary text-text-secondary',
            },
            shape: {
                circle: 'aspect-square rounded-full justify-center items-center px-0.5',
                default: 'aspect-auto rounded-sm',
            },
            border: {
                none: 'border-none ',
                svg: 'border-none [&>*]:transition-color [&>*]:duration-200 [&>*]:ease-out hover:[&>svg]:text-accent active:[&>svg]:text-accent',
                default:
                    'border-secondary border-1 shadow-xs shadow-glow hover:border-accent active:border-accent hover:shadow-accent/50 ',
            },
        },
        compoundVariants: [
            // Compound variants for circle + sizes
            {
                size: 'small',
                shape: 'circle',
                class: 'min-w-8 max-w-8 w-8 [&>svg]:h-6 [&>svg]:w-6',
            },
            {
                size: 'medium',
                shape: 'circle',
                class: 'min-w-12 max-w-10 w-10 [&>svg]:h-8 [&>svg]:w-8',
            },
            {
                size: 'large',
                shape: 'circle',
                class: 'min-w-30 max-w-20 w-20 [&>svg]:h-18 [&>svg]:w-18',
            },
        ],
        defaultVariants: {
            size: 'medium',
            color: 'primary',
            shape: 'default',
            border: 'default',
        },
    }
)

export const Button = ({
    className,
    size = 'medium',
    shape = 'default',
    border = 'default',
    children,
    ...props
}: {
    className?: string
    size?: 'small' | 'medium' | 'large'
    shape?: 'default' | 'circle'
    border?: 'none' | 'default' | 'svg'
    children?: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    return (
        <button
            className={cn(
                buttonStyles({
                    size: size,
                    shape: shape,
                    border: border,
                }),
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}

// Ensure the Button component is exported
export default Button
