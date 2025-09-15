import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Layout from "./components/layout/Layout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/404";
import AllCourses from "./pages/AllCourses";
import MyCourses from "./pages/MyCourses";
import CourseLandingPage from "./pages/CourseLandingPage";
import CoursePlayer from "./pages/CoursePlayer";
import "react-toastify/dist/ReactToastify.css";

import Form from "./pages/Form";

function PrivateRoutes({ userType }) {
  const token = localStorage.getItem("JWT");

  if (!token) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Auth />} />
      

        <Route element={<PrivateRoutes userType={"student"} />}>
          <Route path="/" element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/all-courses" element={<AllCourses />} />
            <Route path="/courses" element={<MyCourses />} />
            <Route path="/course/:id" element={<CourseLandingPage />} />
            <Route path="/form" element={<Form />} />
            <Route path="/modules" element={<CoursePlayer />} />
          </Route>
        </Route>

        <Route path="/*" element={<NotFound />} />
      </Routes>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        pauseOnHover={false}
      />
    </>
  );
}

export default App;
