import {
    ContextMenu as ContextMenuPrimitive,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from '@/components/ui/base/ContextMenu'

export const ContextMenu = ({ title }: { title: string }) => {
    return (
        <ContextMenuContent>
            <ContextMenuItem>{title}</ContextMenuItem>
        </ContextMenuContent>
    )
}

export const ContextMenuProvider = ({
    children,
}: {
    children: React.ReactNode
}) => {
    return (
        <ContextMenuPrimitive>
            {/* <ContextMenuTrigger>Right click</ContextMenuTrigger> */}
            {children}
        </ContextMenuPrimitive>
    )
}
