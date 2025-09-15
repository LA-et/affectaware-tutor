import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PekanuTheme from "../store/Theme";
import { useHttpRequest } from "../hooks/httpClient";
import Loader from "../components/utils/Loader";
import dispatchMessage from "../hooks/messageHandler";
import { useParams } from "react-router-dom";
import useEventLogger, { ACTIONS } from "../hooks/eventLogger";
import { apiResponse } from "../utils/httpResponse";

export default function CourseLandingPage() {
  const sendRequest = useHttpRequest();
  const navigate = useNavigate();
  const course_id = useParams().id;
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState([]);
  const [ModelData, setModelData] = useState([]);
  const jwt = localStorage.getItem("JWT");
  const [rerender, setRerender] = useState(false);
  const logEvent = useEventLogger();

  useEffect(() => {
    const getCourseById = async () => {
      setLoading(true);
      const payload = {
        jwt,
        courseid: course_id,
      };

      try {
        const response = await apiResponse(
          `/course/course_details`,
          "POST",
          payload
        );
        setCourseData(response.Success);
        setModelData(response.Modules);
        // if (courseData) {
        //   getUserLog("View More", courseData.Title, courseData.CourseID);
        // }
        setLoading(false);
      } catch (error) {
        setCourseData(error.response.Error);
      }
    };
    getCourseById();
  }, [course_id, rerender]);

  const getUserLog = async (action,title,id) => {
    const payload = {
      jwt,
      action: action,
      details: {
        CourseID: courseData.CourseID,
        Title: courseData.Title,
      },
    };

    try {
      const response = await apiResponse(`/user/user_logs`, "POST", payload);
    } catch (error) {
    }
  };


  const handleRegister = async () => {
    const payload = {
      jwt,
      courseid: course_id,
    };

    try {
      const response = await apiResponse(
        `/course/enrol_course`,
        "POST",
        payload
      );
      dispatchMessage("success", response.Success);
      getUserLog("Enroll");
      navigate("/courses");
    } catch (error) {
      dispatchMessage("error", error.response.Error);
    }
  };

  if (loading) {
    return (
      <div>
        <Loader height="600px" />
      </div>
    );
  }

  return (
    <PekanuTheme>
      {!loading && (
        <div sx={{ flexGrow: 1 }}>
          <div
            className="grid grid-cols-1 lg:grid-cols-3 mb-5 md:mb-0 items-center justify-items-center fixed"
          >
            <div className="col-span-1 border lg:sticky lg:top-0 h-fit pb-10">
              <Box
                sx={{
                  display: "flex",
                  borderRadius: "6px",
                  overflow: "hidden",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div className="flex justify-between mx-auto">
                  <img
                    src={
                      import.meta.env.VITE_SERVER_ENDPOINT +
                      `/content/${courseData?.Thumbnail}`
                    }
                    className=" p-15 w-full h-full object-contain"
                    alt="react"
                  />
                </div>
                <div className="my-5">
                  <strong
                    className="text-center text-md lg:text-2xl font-bold"
                    gutterBottom
                  >
                    {courseData?.Title}
                  </strong>
                </div>

                <div style={{ marginBottom: "8px" }}>
                  {" "}
                  <p
                    className="text-xs lg:text-sm px-4 text-justify"
                    variant="subtitle-3"
                  >
                    {courseData?.Description}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Button
                    onClick={handleRegister}
                    variant="outlined"
                    style={{
                      backgroundColor: "#1A56DB",
                      color: "#fff",
                    }}
                    className="py-3 px-8"
                  >
                    Enroll
                  </Button>
                </div>
              </Box>
            </div>

            <div className=" lg:pt-12 lg:px-4 col-span-2  h-[calc(100vh-3rem)] overflow-y-auto mb-5">
              <Box
                sx={{
                  borderRadius: "6px",
                  overflowY: "auto",
                  padding: "15px",
                }}
              >
                <strong className="text-start text-md lg:text-2xl font-bold">
                  What you will learn
                </strong>
                <div className="md:ml-8">
                  {" "}
                  <div className="my-5 text-left text-xs lg:text-lg">
                    {courseData?.Learnings && (
                      <ul>
                        {courseData.Learnings.map((learning, index) => (
                          <li className="list-disc" key={index}>
                            {learning}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <strong className=" text-center text-md lg:text-2xl font-bold">
                  Course Content
                </strong>
                {ModelData?.map((module, index) => (
                  <Accordion key={index} className="mt-5">
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <div className="text-sm lg:text-md font-bold">
                        Module {index + 1}: {module.Title}
                      </div>
                    </AccordionSummary>
                    <AccordionDetails>
                      <div className="text-xs lg:text-sm font-bold">
                        {module?.Description}
                      </div>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </div>
          </div>
        </div>
      )}
    </PekanuTheme>
  );
}
