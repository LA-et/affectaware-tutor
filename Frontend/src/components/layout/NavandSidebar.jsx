import { useContext } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { useTheme } from "@mui/material/styles";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import LibraryBooksRoundedIcon from "@mui/icons-material/LibraryBooksRounded";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import Brand from "../utils/Brand";
import { DashboardDrawer, DashboardHeading } from "./DashboardFrame";
import { useNavigate } from "react-router-dom";

import useEventLogger, {ACTIONS} from "../../hooks/eventLogger";

export default function NavandSidebar({ open, setOpen,type="user" }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const logEvent = useEventLogger();

  const logout = () => {
    // logEvent({ action: ACTIONS.LOGOUT });
    localStorage.removeItem("JWT");

    setTimeout(() => {
      window.location.href = "/";
      window.location.reload();
    }, 300);
  };
  

  const navItems = [
    // {
    //   text: "Home",
    //   icon: HomeRoundedIcon,
    //   type: "nav",
    //   nav: "/dashboard",
    //   action:ACTIONS.DASHBOARD,
    // },
    {
      text: "My Courses",
      icon: LibraryBooksRoundedIcon,
      type: "nav",
      nav: "/courses",
       action:ACTIONS.MY_COURSES,
    },
    {
      text: "All Courses",
      icon: SchoolRoundedIcon,
      type: "nav",
      nav: "/all-courses",
       action:ACTIONS.ALL_COURSES,
    },
    {
      text: "Logout",
      icon: ExitToAppRoundedIcon,
      type: "action",
      action: logout,
    },
  ];

  const adminNavItems = [
    {
      text: "Home",
      icon: HomeRoundedIcon,
      type: "nav",
      nav: "/admin",
       action:"Dashboard",
    },
    {
      text: "Logout",
      icon: ExitToAppRoundedIcon,
      type: "action",
      action: logout,
    },
  ];

  const handleNavClick = (navItem) => {
  
    if (navItem.type === "nav") {
      logEvent({ action: navItem.action, details: navItem.text });
      navigate(navItem.nav);
    } else if (navItem.type === "action" && typeof navItem.action === "function") {
      navItem.action();
    }
  };
  
  

  return (
    <>
      <CssBaseline />
      <DashboardHeading
        open={open}
        handleDrawerOpen={() => {
          setOpen(true);
        }}
      >
        <Brand
          imageClassName="h-10"
          textClassName="text-2xl text-gray-800 font-medium"
          className=""
        />
      </DashboardHeading>
      <DashboardDrawer
        theme={theme}
        open={open}
        handleDrawerClose={() => {
          setOpen(false);
        }}
        type={type}
        items={type === "admin" ? adminNavItems : navItems}
        onItemClick={handleNavClick}
      />
    </>
  );
}
