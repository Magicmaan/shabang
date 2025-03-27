import '../../styles/Theme.css'
import '../../input.css'
import Widget from './base/Widget'

const QuickWidgets = () => {
    const numWidgets = 3
    return (
        <div className="flex h-auto w-auto min-w-6 flex-col items-center justify-start gap-2 px-2">
            {Array.from({ length: numWidgets }, (_, i) => (
                <Widget index={i} />
            ))}
        </div>
    )
}

export default QuickWidgets
