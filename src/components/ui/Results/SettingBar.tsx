import { Settings2 } from "lucide-react";

interface ButtonProps {
	onClick?: () => void;
	children?: React.ReactNode;
	className?: string;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, className }) => {
	return (
		<button
			onClick={onClick}
			className={`${className} hover:bg-selected text-text text-sm font-bold py-0 h-8 px-4 rounded-sm `}>
			{children}
		</button>
	);
};

const ButtonSquare: React.FC<ButtonProps> = ({ onClick, children, className }) => {
	return (
		<button
			onClick={onClick}
			className={`${className} hover:bg-selected text-text text-sm font-bold p-0 h-8 rounded-sm aspect-square center `}>
			{children}
		</button>
	);
};

const Divider = () => {
	return <div className="w-0.5 h-6 bg-secondary"></div>;
};

const SettingBar = () => {
	return (
		<div className="w-full h-auto flex flex-col gap-1 items-center">
			<div className="w-full h-auto flex flex-row px-1 gap-2 justify-between items-center">
				<div className="h-10 flex p-1 gap-0   items-center">
					<Button>Files</Button>
					<Divider />
					<Button>Apps</Button>
					<Divider />
					<Button>Settings</Button>
				</div>
				<div className="h-10 flex p-1 gap-2 ">
					<ButtonSquare className="bg-secondary">
						<Settings2 width={20} height={20} />
					</ButtonSquare>
				</div>
			</div>
			<div className="relative w-98/100 h-0.5 bg-secondary opacity-50 "> </div>
		</div>
	);
};

export default SettingBar;
