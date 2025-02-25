import "../styles/Theme.css";
import "../input.css";
import img from "../assets/FakeBackground.png";

const FakeBackground = () => {
	return (
		<div className="w-full h-full absolute -z-50 bg-red-500 top-0 left-0">
			<img src={img} className="w-full h-full " alt="Fake Background" />
		</div>
	);
};
export default FakeBackground;
