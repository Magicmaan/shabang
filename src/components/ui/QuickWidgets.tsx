import "../../styles/Theme.css";
import "../../input.css";
import Widget from "./base/Widget";

const QuickWidgets = () => {
	const numWidgets = 3;
	return (
		<div className="flex flex-col justify-start items-center w-auto min-w-6 h-auto  px-2 gap-2">
			{Array.from({ length: numWidgets }, (_, i) => (
				<Widget key={i} />
			))}
		</div>
	);
};

export default QuickWidgets;
