import { useState } from "react";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import dispatchMessage from "../../hooks/messageHandler";
import { apiResponse } from "../../utils/httpResponse";
import { useDebounce } from "use-debounce";
import { IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

function Register({ changeTab }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [institute, setInstitute] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null); 
  const [debouncedUsername] = useDebounce(username, 1000); 
  const [showPassword, setShowPassword] = useState(false); // Toggle for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const checkUsernameAvailability = async (username) => {
    if (username.trim() === "") {
      setUsernameAvailable(null);
      return;
    }
  
    try {
      const response = await apiResponse("/user/username_avail", "POST", { username }); // Send username in the body
      if (response.Status) {
        setUsernameAvailable("Username is available!");
      } else {
        setUsernameAvailable("Username is already taken.");
      }
    } catch (error) {
      setUsernameAvailable("Error checking username.");
    }
  };
  

  useState(() => {
    checkUsernameAvailability(debouncedUsername);
  }, [debouncedUsername]);

  const registerHandler = async (e) => {
    e.preventDefault();

    if (!username || !password || !confirmpassword || !email || !name || !grade || !institute) {
      dispatchMessage("warn", "Please fill in all the fields");
      return;
    }

    if (password !== confirmpassword) {
      dispatchMessage("warn", "Passwords didn't match");
      return;
    }

    const payload = {
      email,
      username,
      name,
      password,
      con_password: confirmpassword,
      grade,
      institute,
    };

    try {
      const response = await apiResponse("/user/register", "POST", payload);
      dispatchMessage("success", response.Success);
      setUsername("");
      setPassword("");
      setEmail("");
      setName("");
      setGrade("");
      setInstitute("");
      setConfirmPassword("");
      changeTab(null, "login"); 
    } catch (error) {
      dispatchMessage("error", error.response.Error);
    }
  };

  const handleEmailFocus = () => {
    checkUsernameAvailability(username);
  };

  return (
    <form onSubmit={registerHandler} className="mx-auto w-full lg:w-2/3">
      <Stack className="w-full items-center" spacing={3}>
        <TextField
          label="Username"
          variant="outlined"
          type="text"
           className="w-11/12"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          error={usernameAvailable && usernameAvailable.includes("taken")}
          helperText={usernameAvailable}
        />

        <TextField
          label="Email"
          variant="outlined"
          type="email"
           className="w-11/12"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={handleEmailFocus} 
          required
        />
        <TextField
          label="Name"
          variant="outlined"
          type="text"
           className="w-11/12"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextField
          label="Grade"
          variant="outlined"
           className="w-11/12"
          type="text"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          required
        />
        <TextField
          label="Institute"
          variant="outlined"
          type="text"
           className="w-11/12"
          value={institute}
          onChange={(e) => setInstitute(e.target.value)}
          required
        />
        <TextField
          label="Password"
          className="w-11/12"
          variant="outlined"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Confirm Password"
          variant="outlined"
           className="w-11/12"
          type={showConfirmPassword ? "text" : "password"}
          value={confirmpassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          error={confirmpassword && password !== confirmpassword} // Red border if passwords don't match
          helperText={
            confirmpassword && password !== confirmpassword ? "Passwords do not match" : ""
          }
        />
        <Button variant="contained" type="submit">
          Register
        </Button>
      </Stack>
    </form>
  );
}

export default Register;
