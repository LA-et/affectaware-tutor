import { useState } from "react";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

// import { useNavigateAuthorised } from "../hooks/authCookie";

import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import Brand from "../components/utils/Brand";

function Auth() {
  // useNavigateAuthorised();

  const [auth, setAuth] = useState("login");

  const handleTabChange = (event, newTab) => {
    setAuth(newTab);
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      <Brand />
      <Box
        sx={{
          paddingTop: 1.5,
          paddingBottom: 3,
          borderRadius: "10px",
          bgcolor: "#",
        }}
        className="w-5/6 md:w-1/3 mt-16"
      >
        {/* <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",

            width: "100%",
          }}
        >
          <Tabs onChange={handleTabChange} value={auth}>
            <Tab
              label="Login"
              value="login"
              className="w-1/2"
              style={{
                color: "black",
                fontFamily:
                  "Inter var,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji",
              }}
            />
            <Tab
              label="Register"
              value="register"
              className="w-1/2"
              style={{
                color: "black",
                fontFamily:
                  "Inter var,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji",
              }}
            />
          </Tabs>
        </Box> */}

        <div className="mt-8">
          {auth === "login" ? (
            <Login changeTab={handleTabChange} />
          ) : (
            <Register changeTab={handleTabChange} />
          )}
        </div>
      </Box>
    </div>
  );
}

export default Auth;
