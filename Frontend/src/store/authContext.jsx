import { useState, useEffect, useCallback } from "react";
import { createContext } from "react";

const authContext = createContext({
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  fetchMe: async () => {},
  user: null,
  type: "student",
});

export { authContext };

import { useHttpRequest } from "../hooks/httpClient";
import dispatchMessage from "../hooks/messageHandler";
import useEventLogger, {ACTIONS} from "../hooks/eventLogger";

const AuthContextProvider = (props) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [type, setType] = useState("student");

  const sendRequest = useHttpRequest();
  const login = (res) => {
    if (res?.user) {
      setUser(res.user);
      setIsAuthenticated(true);
      setType(res.type);
    } else {
      setIsAuthenticated(false);
    }
  };
  const fetchMe = useCallback(async () => {
    setIsLoading(true);
    try {
      let res = await sendRequest("/api/user/me");
      login(res.data);
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = async () => {
    const logEvent = useEventLogger();
    const res = await sendRequest("/api/user/logout", {
      method: "POST",
    });
    
      logEvent({
        action: ACTIONS.LOGOUT,
      });
      
    localStorage.clear();

    setIsAuthenticated(false);
    setUser(null);
    dispatchMessage("success", "logout successfull");
    setType("student");
  };

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <authContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        fetchMe,
        login,
        logout,
        type,
      }}
    >
      {props.children}
    </authContext.Provider>
  );
};

export default AuthContextProvider;
