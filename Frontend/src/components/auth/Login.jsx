import { useState, useContext } from "react";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import dispatchMessage from "../../hooks/messageHandler"; 
import { useNavigate } from "react-router-dom"; 
import { apiResponse } from "../../utils/httpResponse";
import useEventLogger from "../../hooks/eventLogger";


function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); 
  };

  const navigate = useNavigate();
   const logEvent = useEventLogger();

  const loginHandler = async (e) => {
    e.preventDefault();
  
    if (!username || !password) {
      dispatchMessage("warn", "Please fill in both username and password");
      return;
    }
  
    const payload = {
      username,
      password,
    };
  
    try {
      const response = await apiResponse("/user/login", "POST", payload);
      
      if (response.Success) {
        dispatchMessage("success", response.Success);
        if (response.isPasswordCompromised) {
          dispatchMessage("warn", "Your password has been found in a data breach. Please change your password.");
        } else {
          localStorage.setItem("JWT", response.JWT); 
  
          navigate("/courses");
         
        
        }
      } else {
        dispatchMessage("error", "Invalid username or password.");
      }
    } catch (error) {
      dispatchMessage("error", error?.Error || "An error occurred during login.");
    }
  };
  

  return (
    <form onSubmit={loginHandler} className=" mx-auto w-full lg:w-2/3">
      <div className="flex justify-center items-center">
      <h2 className="mb-5 text-3xl">Welcome!</h2>
      </div>
      <Stack className="w-full items-center" spacing={3}>
        <TextField
          label={<span className="font">Username</span>}
          id="username"
          variant="outlined"
          type="text"
          className="w-full p-2 border rounded "
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <TextField
          label={<span className="font">Password</span>}
          id="password"
          variant="outlined"
          type={showPassword ? "password" : "text"}
          className="w-full p-2 border rounded"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <IconButton onClick={togglePasswordVisibility} edge="end">
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            ),
          }}
        />

        <Button
          className="w-full p-2 border rounded font"
          style={{
            color: "#fff", 
          }}
          variant="contained"
          type="submit"
        >
          Login
        </Button>
      </Stack>
    </form>
  );
}

export default Login;
