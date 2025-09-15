import { useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.png";

function Brand({
  imageClassName = "h-20",
  textClassName = "text-3xl",
  className = "p-6",
}) {
  const navigate = useNavigate();
  return (
    <div className={`flex items-center justify-center w-full ${className}`}>
      <img
        onClick={() => {
          navigate("/");
        }}
        src={Logo}
        alt="Pekanu Logo"
        className={`${imageClassName} cursor-pointer`}
      />
      <div className={`ml-4 font-roboto ${textClassName}`}>
        Pekanu <span style={{ color: "#00B4D8" }}>e</span>Tutor
      </div>
    </div>
  );
}

export default Brand;
