import '../../styles/Theme.css'
import '../../input.css'
import Widget from './base/Widget'

const QuickWidgets = () => {
    const numWidgets = 3
    return (
        <div
            className="flex h-full w-auto min-w-6 flex-col items-end justify-start gap-2 bg-red-500 px-2"
            style={{
                gridArea: 'left',
            }}
        >
            {Array.from({ length: numWidgets }, (_, i) => (
                <Widget index={i} />
            ))}
        </div>
    )
}

export default QuickWidgets
