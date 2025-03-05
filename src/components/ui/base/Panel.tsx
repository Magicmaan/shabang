import React from "react";

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {}

const Panel: React.FC<PanelProps & React.RefAttributes<HTMLDivElement>> =
	React.forwardRef(({ children, className = "", ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={`bg-primary w-full flex  
							justify-start min-w-12 items-center 
							rounded-md p-1 border-2 border-border 
							drop-shadow scrollbar text-text ${className} 
							`}
				{...props}>
				{children}
			</div>
		);
	});

export default Panel;
