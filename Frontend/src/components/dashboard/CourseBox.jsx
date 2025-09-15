import Swal from "sweetalert2"; // Import SweetAlert2
import Box from "@mui/material/Box";
import { Stack, Button } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useEventLogger, { ACTIONS } from "../../hooks/eventLogger";
import { apiResponse } from "../../utils/httpResponse";
import { useEffect, useState } from "react";
import dispatchMessage from "../../hooks/messageHandler";

export default function CourseBox({
  image,
  courseName,
  description,
  courseID,
}) {
  const logEvent = useEventLogger();
  const location = useLocation();
  const isCoursePage = location.pathname.includes("/courses");
  const [courseData, setCourseData] = useState({});
  const [courseStoreData, setCourseStoreData] = useState({});
  const jwt = localStorage.getItem("JWT");
  const [buttonText, setButtonText] = useState("");
  const [disabled, setDisabled] = useState(false);
  const navigate = useNavigate();

  const [logging, setLogging] = useState(false);

  const getUserLog = async (action) => {
    if (logging) return; // prevent multiple hits
    if (!jwt || !courseName || !courseID) return; // check for valid payload

    setLogging(true);

    const payload = {
      jwt,
      action,
      details: {
        CourseID: courseName,
        Title: courseID,
      },
    };

    try {
      await apiResponse(`/user/user_logs`, "POST", payload);
      console.log("User log sent successfully.");
    } catch (error) {
      console.error("Logging error:", error?.response?.data?.Error);
    } finally {
      setLogging(false);
    }
  };



  useEffect(() => {
    const getCourseById = async () => {
      const payload = {
        jwt,
        courseid: courseID,
      };

      try {
        const response = await apiResponse(
          `/course/course_status`,
          "POST",
          payload
        );
        setCourseData(response.Success);
        switch (response.Success.Status) {
          case "NOT STARTED":
            setButtonText("Start");
            setDisabled(false);
            break;
          case "COMPLETE":
            setButtonText("Complete");
            setDisabled(true);
            break;
          // case "STARTED":
          //   setButtonText("Continue");
          //   setDisabled(false);
          //   break;
          default:
            setButtonText("Continue");
            setDisabled(false);
            break;
        }
      } catch (error) {
        setCourseData(error?.response?.data?.Error);
      }
    };
    if (courseID) {
      getCourseById();
    }
  }, [courseID]);

  const handleStart = async () => {
    if (buttonText === "Start") {
      const payload = {
        jwt,
        courseid: courseID,
      };

      try {
        const response = await apiResponse(
          `/course/course_queue`,
          "POST",
          payload
        );

        Swal.fire({
          title: "Success",
          text: response.Success,
          icon: "success",
          confirmButtonText: "Continue",
          customClass: {
            confirmButton:
              "bg-blue-500 text-white hover:bg-white hover:text-blue-500 border hover:border-blue-500 px-4 py-2 rounded-md font-medium",
          },
        }).then(async () => {
          try {
            const secondResponse = await apiResponse(
              `/course/course_queue`,
              "POST",
              payload
            );
            getUserLog(buttonText);
            setCourseStoreData(secondResponse)
            if (
              secondResponse?.Question?.TestType === "PreTest" ||
              secondResponse?.Question?.TestType === "PostTest"
            ) {
              navigate("/form", {
                state: { questionData: secondResponse.Question },
              });
            } else if (secondResponse?.Success?.TestType === "Modules") {
              navigate("/modules", {
                state: { moduleData: secondResponse.Success },
              });
            } else {
              Swal.fire({
                title: "Info",
                text: "No further content available.",
                icon: "info",
                confirmButtonText: "Okay",
              });
            }
          } catch (error) {
            const errorMessage =
              error.response?.Error ||
              "An error occurred while fetching the next course content.";
            Swal.fire({
              title: "Error",
              text: errorMessage,
              icon: "error",
              confirmButtonText: "Okay",
            });
          }
        });
      } catch (error) {
        const errorMessage =
          error.response?.Error ||
          "An error occurred while fetching the course queue.";
        Swal.fire({
          title: "Error",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "Okay",
        });
      }
    } else if (buttonText === "Continue") {
      const payload = {
        jwt,
        courseid: courseID,
      };

      try {
        const response = await apiResponse(
          `/course/course_queue`,
          "POST",
          payload
        );
        getUserLog(buttonText);
        if (
          response?.Question?.TestType === "PreTest" ||
          response?.Question?.TestType === "PostTest"
        ) {
          navigate("/form", { state: { questionData: response.Question } });
        } else if (response?.Success?.TestType === "Modules") {
          navigate("/modules", { state: { moduleData: response.Success } });
        } else {
          Swal.fire({
            title: "Info",
            text: "No further content available.",
            icon: "info",
            confirmButtonText: "Okay",
          });
        }
      } catch (error) {
        const errorMessage =
          error.response?.Error ||
          "An error occurred while fetching the next course content.";
        Swal.fire({
          title: "Error",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "Okay",
        });
      }
    }
  };


  return (
    <Box
      sx={{
        width: 250,
        minHeight: 250,
        padding: 0,
        backgroundColor: "#f0f8fa",
        overflow: "hidden",
        transition: "box-shadow 0.3s, opacity 0.3s",
        "&:hover": {
          boxShadow: "0px 8px 12px rgba(0, 0, 0, 0.2)",
          opacity: 0.8,
        },
        fontFamily:
          "Inter var,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji",
      }}
    // onClick={() => {
    //   getUserLog("View More");
    // }}
    >
      <Stack>
        <div className="w-40 h-40 mx-auto">
          <img
            src={image}
            alt={courseName}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="px-2 py-4">
          <h3 className="text-center p-1 text-l font-bold">{courseName}</h3>
          <p className="text-center p-1 text-xs line-clamp-2">{description}</p>
          {isCoursePage && (
            <div className="my-8 flex justify-center items-center">
              <Button
                variant="outlined"
                style={{
                  padding: "5px 30px",
                  backgroundColor: "#1A56DB",
                  color: "#fff",
                }}
                disabled={disabled}
                onClick={handleStart}
              >
                {buttonText}
              </Button>
            </div>
          )}
          {!isCoursePage && (
            // <div className="my-8 flex justify-center items-center">
            //   <Link to={`/course/${courseID}`}>
            //     <Button
            //       variant="outlined"
            //       style={{
            //         padding: "5px 30px",
            //         backgroundColor: "#1A56DB",
            //         color: "#fff",
            //       }}
            //       onClick={() => {
            //         getUserLog("View More");
            //       }}
            //     >
            //       View More
            //     </Button>
            //   </Link>
            // </div>
            <div className="my-8 flex justify-center items-center">
              <Button
                variant="outlined"
                style={{
                  padding: "5px 30px",
                  backgroundColor: "#1A56DB",
                  color: "#fff",
                }}
                disabled={logging} // disable while logging to prevent multiple clicks
                onClick={async () => {
                  await getUserLog("View More");
                  navigate(`/course/${courseID}`);
                }}
              >
                View More
              </Button>
            </div>

          )}
        </div>
      </Stack>
    </Box>
  );
}
