import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { Card, CardActionArea, Divider, CircularProgress } from "@mui/material";
import Loader from "../components/utils/Loader";
import { apiResponse } from "../utils/httpResponse";
import dispatchMessage from "../hooks/messageHandler";
import Swal from "sweetalert2";
import useEventLogger from "../hooks/eventLogger";

const ProgressBar = ({ progress }) => (
  <Box sx={{ width: "100%", height: "8px", backgroundColor: "#e0e0e0", borderRadius: "4px" }}>
    <Box sx={{ height: "100%", width: `${progress}%`, backgroundColor: "#1976d2", borderRadius: "4px" }} />
  </Box>
);

const handleApiCall = async (url, method, payload) => {
  try {
    const response = await apiResponse(url, method, payload);
    return response;
  } catch (error) {
    const errorMessage = error.response?.Error || "Something went wrong";
    dispatchMessage("error", errorMessage);
    throw new Error(errorMessage);
  }
};

export default function Form() {
  const jwt = localStorage.getItem("JWT");
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [slide, setSlide] = useState(false);
  const [questionData, setQuestionData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const logEvent = useEventLogger();

  useEffect(() => {
    if (location.state?.questionData) {
      setQuestionData(location.state.questionData);
    }
  }, [location.state]);

  const handleSubmit = async () => {
    setLoading(true);
    const payload = {
      jwt,
      courseid: questionData.CourseID,
      testtype: questionData.TestType,
      testid: questionData.TestID,
      questionid: questionData.ID,
      question: questionData.Question,
      answer: selectedAnswer,
    };

    try {
      const response = await handleApiCall("/course/completion_status", "POST", payload);
      setSlide(true);

      const nextResponse = await handleApiCall("/course/course_queue", "POST", { jwt, courseid: questionData.CourseID });
      getUserLog(nextResponse?.Question?.TestType);

      if (nextResponse?.Success === "PreTest completed successfully!") {
        await Swal.fire({
          title: "PreTest Completed!",
          text: nextResponse.Success,
          icon: "success",
          confirmButtonText: "OK",
          customClass: { confirmButton: "bg-blue-500 text-white" },
        });

        const followUpResponse = await handleApiCall("/course/course_queue", "POST", { jwt, courseid: questionData.CourseID });
        getUserLog(followUpResponse?.Question?.TestType);

        if (["PreTest", "PostTest"].includes(followUpResponse?.Question?.TestType)) {
          navigate("/form", { state: { questionData: followUpResponse.Question } });
        } else if (followUpResponse?.Success?.TestType === "Modules") {
          navigate("/modules", { state: { moduleData: followUpResponse.Success } });
        } else {
          dispatchMessage("info", "No more questions available.");
          navigate("/courses");
        }
      } else if (nextResponse?.Success === "You have completed this course successfully!") {
        await Swal.fire({
          title: "Congratulations!",
          text: nextResponse.Success,
          icon: "success",
          confirmButtonText: "OK",
          customClass: { confirmButton: "bg-blue-500 text-white" },
        });
        getUserLog("Complete");
        navigate("/courses");
      } else if (nextResponse?.Question) {
        setQuestionData(nextResponse.Question);
        setSelectedAnswer("");
        if (["PreTest", "PostTest"].includes(nextResponse?.Question?.TestType)) {
          navigate("/form", { state: { questionData: nextResponse.Question } });
        } else if (nextResponse?.Success?.TestType === "Modules") {
          navigate("/modules", { state: { moduleData: nextResponse.Success } });
        }
      } else {
        dispatchMessage("info", "No more questions available.");
        navigate("/courses");
      }
    } catch (error) {
      dispatchMessage("error", error.message || "Something went wrong");
    } finally {
      setSlide(false);
      setLoading(false);
    }
  };

  const getUserLog = async (action) => {
    const payload = {
      jwt,
      action,
      details: {
        CourseID: questionData.CourseID,
        moduleID: questionData.ModuleID,
        moduleTitle: questionData.Module_Name,
        ContentType: questionData.Content_Type,
        CourseTitle: questionData.Course_Title,
        CourseType: questionData.Course_Type,
        questionid: questionData.QuestionID,
        Question_Number: questionData.Question_Number,
      },
    };
    try {
      await apiResponse(`/user/user_logs`, "POST", payload);
    } catch (error) {
      console.error(error.response?.Error);
    }
  };

  const handleOptionChange = (option) => {
    setSelectedAnswer(option);
    logEvent({
      action: questionData.TestType,
      details: {
        CourseID: questionData.CourseID,
        TestType: questionData.TestType,
        TestID: questionData.TestID,
        Question_Number: questionData.Question_Number,
        ContentType: questionData.Content_Type,
        CourseTitle: questionData.Course_Title,
        ID: questionData.ID,
        questionid: questionData.Question,
      },
    });
  };

  if (loading || !questionData) return <Loader height="600px" />;

  return (
    <Box className="fixed w-full" sx={{ minHeight: "100vh", background: "#f4f6f8", py: 1 }}>
      <Container  maxWidth="md">
        <Box sx={{ backgroundColor: "#fff", borderRadius: 3, boxShadow: 3, p: { xs: 2, sm: 4 } }}>
          <Typography variant="h6" align="center" gutterBottom>
            Question {questionData?.Question_Number} of {questionData?.Total_Questions}
          </Typography>
          <ProgressBar progress={(questionData?.Question_Number / questionData?.Total_Questions) * 100} />

          <Divider sx={{ my: 2 }} />

          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            {questionData?.Question_Number}) {questionData?.Question}
          </Typography>

          <Stack spacing={1}>
            {questionData?.Options?.map((option, index) => (
              <Card
                key={index}
                sx={{
                  border: selectedAnswer === option ? "2px solid #1976d2" : "1px solid #e0e0e0",
                  borderRadius: 2,
                  boxShadow: selectedAnswer === option ? 6 : 1,
                  transition: "0.3s",
                }}
              >
                <CardActionArea onClick={() => handleOptionChange(option)}>
                  <Typography variant="body1" sx={{ p: 2 }}>
                    {option}
                  </Typography>
                </CardActionArea>
              </Card>
            ))}
          </Stack>

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              disabled={!selectedAnswer || loading}
              onClick={handleSubmit}
              sx={{ borderRadius: 2, px: 5 }}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
