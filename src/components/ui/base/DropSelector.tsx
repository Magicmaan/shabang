import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/base/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/base/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/base/popover'
import { Checkbox } from '@components/ui/base/checkbox'

const frameworks = [
    {
        value: 'next.js',
        label: 'Next.js',
    },
    {
        value: 'sveltekit',
        label: 'SvelteKit',
    },
    {
        value: 'nuxt.js',
        label: 'Nuxt.js',
    },
    {
        value: 'remix',
        label: 'Remix',
    },
    {
        value: 'astro',
        label: 'Astro',
    },
]

const Item = ({
    option,
    label,
    onClick,
}: {
    option: { value: string; label: string }
    label: string
    onClick: (option: { value: string; label: string }) => void
}) => {
    return (
        <CommandItem
            key={option.value}
            onMouseDown={() => {
                if (values.find((v) => v.value === option.value)) {
                    setValues(values.filter((v) => v.value !== option.value))
                } else {
                    setValues([...values, option])
                }

                // setValue(option)
            }}
        >
            <Checkbox
                className="bg-white dark:bg-white"
                id={'checkbox_search_' + index}
                checked={!!values.find((v) => v.value === option.value)}
            />

            <span>{option.label}</span>
        </CommandItem>
    )
}

export function DropSelector({
    initialLabel,
    onChange,
    options,
    wildcard = true,
    ...props
}: {
    initialLabel: string
    onChange?: (value: string) => void
    options: { value: string; label: string }[]
    wildcard?: boolean
} & React.HTMLAttributes<HTMLDivElement>) {
    const [open, setOpen] = React.useState(false)
    const [values, _setValues] = React.useState<
        { value: string; label: string }[]
    >([
        {
            value: options.find((o) => o.label === initialLabel)?.value || '',
            label: initialLabel,
        },
    ])

    // if wildcard. add option to toggle all
    if (wildcard) {
        options = [
            {
                value: '*',
                label: 'All',
            },
            ...options,
        ]
    }

    // function to toggle the value within group
    // if wildcard is selected, toggle all
    const toggleValue = React.useCallback(
        (value: { value: string; label: string }) => {
            if (value.value === '*') {
                if (values.length === options.length) {
                    _setValues([])
                } else {
                    _setValues(options)
                }
                return
            }

            if (values.find((v) => v.value === value.value)) {
                _setValues(values.filter((v) => v.value !== value.value))
            } else {
                _setValues([...values, value])
            }
        },
        [values]
    )

    const isChecked = React.useCallback(
        (option: { value: string; label: string }) => {
            return !!values.find((v) => v.value === option.value)
        },
        [values]
    )

    return (
        <Popover open={open} onOpenChange={setOpen} {...props}>
            <PopoverTrigger className="w-auto">
                <Button>
                    {initialLabel}
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command key={0}>
                    <CommandList key={2}>
                        {options.map((option, index) => (
                            <CommandItem
                                key={option.value}
                                onMouseDown={() => {
                                    toggleValue(option)
                                }}
                            >
                                <Checkbox
                                    className="bg-white dark:bg-white"
                                    id={'checkbox_search_' + index}
                                    checked={isChecked(option)}
                                />

                                <span
                                    className={`${option.value === '*' ? 'font-bold' : ''}`}
                                >
                                    {option.label}
                                </span>
                            </CommandItem>
                        ))}
                        {frameworks.length === 0 && (
                            <CommandEmpty key={3}>
                                No frameworks found
                            </CommandEmpty>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export default DropSelector
