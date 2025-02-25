import { Divide, Equal, MinusIcon, Percent, PlusIcon, X } from "lucide-react";
import React, {
	ReactNode,
	ButtonHTMLAttributes,
	useEffect,
	useState,
	useRef,
} from "react";
import { useSearchStore } from "../../../hooks/search/useSearch";
import { debug } from "@tauri-apps/plugin-log";

interface CalculatorButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	value?: string;
	children?: ReactNode;
}

const CalculatorButton: React.FC<CalculatorButtonProps> = ({
	value,
	children,
	...props
}) => {
	const ref = React.useRef<HTMLButtonElement>(null);
	const [isEntered, setIsEntered] = useState(false);

	const onKeyDown = (e) => {
		if (e.key === value?.toString()) {
			setIsEntered(true);
		}
	};
	const onKeyUp = (e) => {
		setTimeout(() => {
			setIsEntered(false);
		}, 100);
	};

	useEffect(() => {
		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("keyup", onKeyUp);

		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("keyup", onKeyUp);
		};
	}, []);

	return (
		<button
			ref={ref}
			className={`flex w-full center h-12 bg-secondary hover:bg-selected transition-colors duration-300 ease-in-out rounded-md ${isEntered ? "bg-selected" : ""}`}
			{...props}
			onKeyDown={(e) => {
				if (e.key === value?.toString()) {
					setIsEntered(true);
				} else {
					setIsEntered(false);
				}
			}}
			onKeyUp={(e) => {
				setTimeout(() => {
					setIsEntered(false);
				}, 100);
			}}>
			{children || value}
		</button>
	);
};

const Row = ({ children }) => {
	return (
		<div className="w-full h-auto flex flex-row gap-1 justify-items-stretch items-stretch bg-blue-300">
			{children}
		</div>
	);
};

export const CalculatorResult = () => {
	const buttonSize = 16;
	const results = useSearchStore((state) => state.searchResults);
	const searchQuery = useSearchStore((state) => state.searchQuery);
	const previousSearchQuery = useSearchStore((state) => state.previousSearchQuery);
	const searchDifference = searchQuery.substring(previousSearchQuery.length);
	const resultType = useSearchStore((state) => state.searchType);

	// useEffect(() => {
	// 	//debug("search difference: " + searchDifference);
	// }, [searchQuery]);

	return (
		<div className="w-full min-h-64 flex flex-col bg-red-200 gap-1 items-stretch justify-evenly">
			<Row>
				<CalculatorButton />
				<CalculatorButton value={1} />
				<CalculatorButton>
					<Percent size={buttonSize} />
				</CalculatorButton>

				<CalculatorButton>
					<Divide size={buttonSize} />
				</CalculatorButton>
			</Row>
			<Row>
				<CalculatorButton value={7} />
				<CalculatorButton value={8} />
				<CalculatorButton value={9} />
				<CalculatorButton value={"*"}>
					<X size={buttonSize} />
				</CalculatorButton>
			</Row>
			<Row>
				<CalculatorButton value={4} />
				<CalculatorButton value={5} />
				<CalculatorButton value={6} />
				<CalculatorButton value={"-"}>
					<MinusIcon size={buttonSize} />
				</CalculatorButton>
			</Row>
			<Row>
				<CalculatorButton value={1} />
				<CalculatorButton value={2} />
				<CalculatorButton value={3} />
				<CalculatorButton value={"+"}>
					<PlusIcon size={buttonSize} />
				</CalculatorButton>
			</Row>
			<Row>
				<CalculatorButton value={0} />
				<CalculatorButton value={0} />
				<CalculatorButton value={"."} />
				<CalculatorButton value={"="}>
					<Equal size={buttonSize} />
				</CalculatorButton>
			</Row>
		</div>
	);
};
