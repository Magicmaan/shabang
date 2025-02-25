import React from "react";

interface WidgetProps {
	className?: string;
	onClick?: () => void;
	onPointerDown?: () => void;
	onPointerUp?: () => void;
	children?: React.ReactNode;
}

const Widget: React.FC<WidgetProps> = ({ className = "", ...props }) => {
	return (
		<button
			className={`w-14 aspect-square bg-primary border-2 border-border rounded-full flex center ${className}`}
			{...props}>
			{props.children || "1"}
		</button>
	);
};

export default Widget;
