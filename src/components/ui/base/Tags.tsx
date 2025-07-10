import { X } from 'lucide-react'
import { TagGroup, TagList, Tag, Button } from 'react-aria-components'

const Tags = () => {
    return (
        <TagGroup
            selectionMode="multiple"
            aria-label="category-selector"
            style={{
                gridArea: 'tags',
            }}
        >
            <TagList>
                <Tag>
                    Files{' '}
                    <Button slot="remove">
                        <X />
                    </Button>
                </Tag>
                <Tag>Apps</Tag>
                <Tag>Google</Tag>
            </TagList>
        </TagGroup>
    )
}

export default Tags
