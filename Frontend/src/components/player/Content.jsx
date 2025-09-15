
import { useState, useEffect } from "react";
import {
  Divider,
  Typography,
  Stack,
  Button,
  CircularProgress,
} from "@mui/material";
import PekanuTheme from "../../store/Theme";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "./VideoPlayer";
import Notes from "../player/Notes";
import Quiz from "./quiz/Quiz";
import ModuleList from "./ModuleList";
import { useHttpRequest } from "../../hooks/httpClient";
import useEventLogger, { ACTIONS } from "../../hooks/eventLogger";
import { apiResponse } from "../../utils/httpResponse";
import dispatchMessage from "../../hooks/messageHandler";
import { Popover } from "antd";

export default function Content({ courseData, onsetType, setType,type, setUpdatedCourseData, updatedCourseData }) {
  // const [updatedCourseData, setUpdatedCourseData] = useState(courseData);
  const modulesArray = Array.isArray(updatedCourseData?.ModuleID)
    ? updatedCourseData.ModuleID
    : [];
  const recentModule = updatedCourseData?.ModuleID || [];
  const index = modulesArray.findIndex(
    (module) => module.CourseID === recentModule
  );
  const [currentIndex, setCurrentIndex] = useState(index < 0 ? 0 : index);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hittype, sethittype] = useState("");
  const course_id = useParams().id;
  const sendRequest = useHttpRequest();

  const navigate = useNavigate();
  const jwt = localStorage.getItem("JWT");
  const logEvent = useEventLogger();

  const [openPopover, setOpenPopover] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handlePopoverOpen = () => {
    setOpenPopover(true);
     getUserLog("Next");
  };

  const handleConfirm = async () => {
    setConfirmLoading(true);
    await handleSubmit();
    setConfirmLoading(false);
    setOpenPopover(false);
  };

  const handleCancel = () => {
    setOpenPopover(false);
     getUserLog("Cancel");
  };

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem("shouldRedirect", "true");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    const shouldRedirect = localStorage.getItem("shouldRedirect");
    if (shouldRedirect) {
      navigate("/courses");
      localStorage.removeItem("shouldRedirect");
    } else {
      setHasMounted(true);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [navigate]);

  const popoverContent = (
    <div className="w-full md:w-[250px] flex flex-col gap-3 p-2">
      <p className="text-gray-700">You won't be able to come back to this section once you go to the next section. Are you sure you want to go to the next section?</p>
      <div className="flex justify-end gap-2">
        <Button 
          size="small" 
          onClick={handleCancel}
          disabled={confirmLoading}
        >
          Cancel
        </Button>
        <Button 
          size="small" 
          type="primary" 
          onClick={handleConfirm}
          disabled={confirmLoading}
        >
          {confirmLoading ? (
            <div className="flex items-center gap-2">
              <CircularProgress size={16} color="inherit" />
              Processing...
            </div>
          ) : (
            'Confirm'
          )}
        </Button>
      </div>
    </div>
  );

  const handleLogEvent = () => {
    logEvent({
      action: ACTIONS.OPENED_MODULE,
      context: {
        moduleID: courseData.ModuleID,
        moduleTitle: courseData.Module_Name,
        ContentType: courseData.Content_Type,
        CourseID: courseData.CourseID,
        CourseTitle: courseData.Course_Title,
        CourseType: courseData.Course_Type,
        questionid: courseData.QuestionID,
        URL: courseData.URL,
      },
    });
  };

  const getUserLog = async (action) => {
    const payload = {
      jwt,
      action: action,
      details: {
        CourseID: updatedCourseData.CourseID,
        Question: updatedCourseData.Question,
        moduleid: updatedCourseData.ModuleID,
        moduleTitle: updatedCourseData.Module_Name,
        questionid: updatedCourseData.QuestionID,
        ContentType: updatedCourseData.Content_Type,
        CourseTitle: updatedCourseData.Course_Title,
        URL: updatedCourseData.URL,
      },
    };

    try {
      const response = await apiResponse(`/user/user_logs`, "POST", payload);
    } catch (error) {
      console.error(error.response.Error);
    }
  };

  const handleSubmit = async (quizAnswer = "") => {
    setLoading(true);
    const payload = {
      jwt,
      courseid: updatedCourseData.CourseID,
      testtype: updatedCourseData.TestType,
      moduleid: updatedCourseData.ModuleID,
      coursetype: updatedCourseData.Course_Type,
      content_type: updatedCourseData.Content_Type,
    };

    if (type === "Quiz") {
      const quizPayload = {
        ...payload,
        questionid: updatedCourseData.QuestionID,
        question: updatedCourseData.QuestionText,
        answer: quizAnswer,
        quizid: updatedCourseData.QuizID,
      };

      try {
        setLoading(true);

        // Send the quiz response
        const response = await apiResponse(
          "/course/completion_status",
          "POST",
          quizPayload
        );
        // dispatchMessage("success", response.Success);


        const secondResponse = await apiResponse(
          "/course/course_queue",
          "POST",
          {
            jwt,
            courseid: updatedCourseData.CourseID,
          }
        );

        // getUserLog(secondResponse.Success.Content_Type);
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
        }
      } catch (error) {
        const errorMessage = error?.response?.Error || "Something went wrong";
        dispatchMessage("error", errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      // For other content types, just handle the general submission
      try {
        setLoading(true);

        const response = await apiResponse(
          "/course/completion_status",
          "POST",
          payload
        );
        // dispatchMessage("success", response.Success);

        const secondResponse = await apiResponse(
          "/course/course_queue",
          "POST",
          {
            jwt,
            courseid: updatedCourseData.CourseID,
          }
        );
        getUserLog("Confirm");
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
        }
      } catch (error) {
        const errorMessage = error?.response?.Error || "Something went wrong";
        dispatchMessage("error", errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const updateTypeAndData = () => {
      if (type === "Quiz" && hittype) {
        setUpdatedCourseData(hittype);
        setType(hittype?.Content_Type || "");
        onsetType(hittype?.Content_Type || "");
      } else if (type !== "Quiz" && courseData) {
        setUpdatedCourseData(courseData);
        setType(courseData?.Content_Type || "");
        onsetType(hittype?.Content_Type || "");
      }
    };

    updateTypeAndData();
  }, [hittype, courseData]);

  const renderContent = () => {
    if (!updatedCourseData || !type) {
      return <Typography>Loading content...</Typography>;
    }
    switch (type) {
      case "Video":
        return (
          <VideoPlayer
            link={updatedCourseData?.URL}
            videoData={updatedCourseData}
          />
        );
      case "Notes":
        return (
          <Notes link={updatedCourseData?.URL} courseData={updatedCourseData} />
        );
      case "Quiz":
        return (
          <Quiz
            courseData={updatedCourseData}
            quiz={updatedCourseData}
            type={type}
            setType={setType}
            hittype={hittype}
            sethittype={sethittype}
            getUserLog={getUserLog}
            handleNext={() => setCurrentIndex((prev) => prev + 1)}
          />
        );
      default:
        return <Typography>No Content Available</Typography>;
    }
  };



  if (!updatedCourseData) {
    return <Spinner />;
  }

  return (
    <PekanuTheme>
      <div className="grid grid-cols-8 gap-3">
        <div className=" col-span-2">
          <ModuleList
            courseData={updatedCourseData}
            setCurrentIndex={setCurrentIndex}
            currentIndex={currentIndex}
          />
          <Divider
            orientation="vertical"
            flexItem
            style={{ paddingRight: "10px" }}
          />
        </div>

        <div className="col-span-6 lg:pt-12 lg:px-4 h-[calc(100vh-3rem)] overflow-y-auto mb-5">
          <div
            style={{
              // minWidth: "650px",
              minHeight: "350px",
              fontWeight: "bold",
            }}
          >
            <div className="flex justify-center items-center">
              <div className="p-5 font-bold text-sm lg:text-2xl"
              >
                {updatedCourseData?.Module_Name || "Module Title"}
              </div>
            </div>
            <div className="border  ">
              {renderContent()}

            </div>

            {/* Navigation Buttons */}
            <Stack
              direction="row"
              spacing={30}
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "20px",
              }}
            >
              <Button
                id="prevButton"
                color="primary"
                variant="outlined"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
              >
                Previous
              </Button>
              {/* <Button
              id="nextButton"
              color="primary"
              variant="outlined"
              // onClick={() =>
              //   setCurrentIndex((prev) =>
              //     Math.min(modulesArray.length - 1, prev + 1)
              //   )
              // }
              onClick={handleSubmit}
              disabled={updatedCourseData.Content_Type === "Quiz"}
            >
              Next
            </Button> */}
              <Popover
                content={popoverContent}
                trigger="click"
                open={openPopover}
                onOpenChange={setOpenPopover}
              >
                <Button
                  id="nextButton"
                  color="primary"
                  variant="outlined"
                  onClick={handlePopoverOpen}
                  disabled={updatedCourseData.Content_Type === "Quiz"}
                >
                  Next
                </Button>
              </Popover>
            </Stack>
          </div>
        </div>
      </div>
      <Stack direction="row">
        {/* Sidebar for navigation */}

        {/* Main content area */}
        {/* <Stack direction="column" style={{ flex: 1 }}>
          <div
            style={{
              minWidth: "650px",
              minHeight: "550px",
              fontWeight: "bold",
            }}
          >
            <Typography
              style={{ padding: "24px", fontWeight: "bold" }}
              variant="h5"
            >
              {courseData?.Course_Title || "Module Title"}
            </Typography>
            <Divider orientation="horizontal" flexItem />
            {renderContent()}
          </div>
          <Divider orientation="horizontal" flexItem />

        
          <Stack
            direction="row"
            spacing={20}
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "45px",
            }}
          >
            <Button
              id="prevButton"
              color="primary"
              variant="outlined"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>
            <Button
              id="nextButton"
              color="primary"
              variant="outlined"
              // onClick={() =>
              //   setCurrentIndex((prev) =>
              //     Math.min(modulesArray.length - 1, prev + 1)
              //   )
              // }
              onClick={handleSubmit}
              disabled={courseData.Content_Type === "Quiz"}
            >
              Next
            </Button>
          </Stack>
        </Stack> */}
      </Stack>
    </PekanuTheme>
  );
}
