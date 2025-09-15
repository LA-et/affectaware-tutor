
import { useEffect, useState } from "react";
import { Button, Stack, IconButton, Typography } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import dispatchMessage from "../../../hooks/messageHandler";
import QuestionAnswers from "./QuestionAnswers";
import { useHttpRequest } from "../../../hooks/httpClient";
import Loader from "../../utils/Loader";
import useEventLogger from "../../../hooks/eventLogger";
import { useNavigate, useParams } from "react-router-dom";
import { apiResponse } from "../../../utils/httpResponse";
import Swal from "sweetalert2";

function Quiz({
  quiz,
  setType,
  type,
  handleNext,
  score,
  getUserLog,
  setScore,
  courseData,
  hittype,
  sethittype
}) {
  const [localeQuiz, setLocaleQuiz] = useState(quiz);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRC, setShowRC] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const navigate = useNavigate();
  const course_id = useParams().id;
  const sendRequest = useHttpRequest();
  const logEvent = useEventLogger();
  
  const jwt = localStorage.getItem("JWT");
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCompletionStatusCalled, setIsCompletionStatusCalled] = useState(false);
  const localeQuestion = localeQuiz?.Question;

  const getUserLog111 = async (action) => {
    const payload = {
      jwt,
      action: action,
      details: {
        CourseID: updatedCourseData.CourseID,
        Question: updatedCourseData.Question,
        moduleid: updatedCourseData.ModuleID,
        questionid: updatedCourseData.QuestionID,
      },
    };
    try {
      const response = await apiResponse(`/user/user_logs`, "POST", payload);
    } catch (error) {
      console.error("Error in getUserLog:", error);
    }
  };

  const handleSubmitAndNext = async () => {
    // setShowRC(true);
    try {
      if (!selectedAnswer) {
        dispatchMessage("error", "Please select an answer.");
        return;
      }
  
      if (!isCompletionStatusCalled) {
        const completionResponse = await apiResponse(
          "/course/completion_status",
          "POST",
          {
            jwt: jwt,
            courseid: localeQuiz.CourseID,
            testtype: localeQuiz.TestType,
            question: localeQuestion,
            answer: selectedAnswer,
            moduleid: localeQuiz.ModuleID,
            quizid: localeQuiz.QuizID,
            coursetype: localeQuiz.Course_Type,
            content_type: localeQuiz.Content_Type,
          }
        );
  
        const message =
          completionResponse?.Success?.Message || "Operation successful";
        // dispatchMessage("success", message);
        setShowRC(true)
        setExplanation(completionResponse?.Success.Explaination || "");
        setCorrectAnswer(completionResponse?.Success.Correct_Answer);
        setSelectedAnswer(completionResponse?.Success.Answer);
        setIsAnswered(completionResponse?.Success.Right);
        setIsCompletionStatusCalled(true);
      } else {
        const courseQueueResponse = await apiResponse(
          "/course/course_queue",
          "POST",
          {
            jwt,
            courseid: localeQuiz.CourseID,
          }
        );

        getUserLog(courseQueueResponse.Success.Content_Type);
       
        // setType(courseQueueResponse?.Success?.Content_Type)
        if (courseQueueResponse?.Success) {
          const message = courseQueueResponse?.Success?.Message;
  
          if (message === "Quiz completed successfully!") {
            Swal.fire({
              title: message,
              text: message === "Quiz completed successfully!"
                ? `Your score: ${courseQueueResponse?.Success?.Score.toFixed(2)} / ${courseQueueResponse?.Success?.Outof}`
                : "",
              icon: "success",
              confirmButtonText: "OK",
              customClass: {
                confirmButton: "bg-blue-500 text-white",
              },
              willClose: async () => {
                setIsQuizCompleted(true);
  
                const newCourseQueue = await apiResponse(
                  "/course/course_queue",
                  "POST",
                  {
                    jwt,
                    courseid: localeQuiz.CourseID,
                  }
                );
  
                const newCourseQueueResponse = newCourseQueue?.Success;
                sethittype(newCourseQueueResponse);
                // renderContent()
  
                if (
                  newCourseQueueResponse === "Modules completed successfully!"
                ) {
                  await Swal.fire({
                    title: "Modules Completed!",
                    text: newCourseQueueResponse,
                    icon: "success",
                    confirmButtonText: "OK",
                    customClass: {
                      confirmButton: "bg-blue-500 text-white",
                    },
                  });
  
                  const finalResponse = await apiResponse(
                    "/course/course_queue",
                    "POST",
                    {
                      jwt,
                      courseid: localeQuiz.CourseID,
                    }
                  );
                  // sethittype(finalResponse?.Success?.Content_Type)
                  if (
                    finalResponse?.Question?.TestType === "PreTest" ||
                    finalResponse?.Question?.TestType === "PostTest"
                  ) {
                    navigate("/form", {
                      state: { questionData: finalResponse.Question },
                    });
                  } else if (finalResponse?.Success?.TestType === "Modules") {
                    navigate("/modules", {
                      state: { moduleData: finalResponse.Success },
                    });
                  }
                }
              },
            });
          } else {
            const updatedQuiz = {
              ...localeQuiz,
              Question: courseQueueResponse?.Success?.Question || "",
              Options: courseQueueResponse?.Success?.Options || [],
              TestType: courseQueueResponse?.Success?.TestType,
              ModuleID: courseQueueResponse?.Success?.ModuleID,
              QuizID: courseQueueResponse?.Success?.QuizID,
              CourseID: courseQueueResponse?.Success?.CourseID,
              Course_Type: courseQueueResponse?.Success?.Course_Type,
              Content_Type: courseQueueResponse?.Success?.Content_Type,
              Question_Number: courseQueueResponse?.Success?.Question_Number,
              Total_Questions: courseQueueResponse?.Success?.Total_Questions,
            };
            setLocaleQuiz(updatedQuiz);
            setSelectedAnswer(null);
            setIsAnswered(false);
            setShowRC(false);
            setExplanation("");
            setCorrectAnswer("");
            setIsCompletionStatusCalled(false);
          }
        } else {
          
          console.error("Error: No Success object in courseQueueResponse:", courseQueueResponse);
        }
       
      }
    } catch (error) {
      console.error("Error in handleSubmitAndNext:", error);
    }
  };


  const handleAnswerSelect = (id, answer) => {
    setSelectedAnswer(answer);
    setLocaleQuiz((prevState) => ({
      ...prevState,
      Question: Array.isArray(prevState.Question)
        ? prevState.Question.map((q) =>
            q.Question === id
              ? {
                  ...q,
                  Answer: answer,
                  Correct_Answer: answer === q.correctAnswer,
                }
              : q
          )
        : prevState.Question,
    }));
  };

  const handleAnswerSelect1 = (id, answer) => {
    setIsAnswered(true);
    setSelectedAnswer(answer);

    setLocaleQuiz((prevState) => {
      // Ensure Question is always an array before performing .map
      const updatedQuiz = { ...prevState };
      if (Array.isArray(updatedQuiz.Question)) {
        updatedQuiz.Question = updatedQuiz?.Question.map((question) => {
          if (question.Question === id) {
            question.Answer = answer;
            question.Correct_Answer = answer === question.correctAnswer;
          }
          return question;
        });
      }
      return updatedQuiz;
    });
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (loading) {
    return <Loader height="400px" />;
  }

  const isLastQuestion = currentQuestionIndex === quiz?.Question?.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  return (
    <div
      style={{
        paddingTop: "10px",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        padding: "20px",
      }}
    >
      <QuestionAnswers
        quiz={quiz}

        localeQuiz={localeQuiz}
        currentQuestionIndex={currentQuestionIndex}
        handleAnswerSelect={handleAnswerSelect}
        showRC={showRC}
        explanationData={explanation}
        answerSelect={selectedAnswer}
        correctAnswer={correctAnswer}
        isCorrect={isAnswered}
      />
      <Stack style={{ paddingTop: "20px" }} spacing={15} direction="row">
        <IconButton
          style={{ color: "#1976D2", opacity: isFirstQuestion ? 0.3 : 1 }}
          disabled={isFirstQuestion}
          onClick={handlePreviousQuestion}
        >
          <NavigateBeforeIcon
            style={{ height: "25px", width: "25px", borderRadius: "50%" }}
          />
        </IconButton>

        {isLastQuestion ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (showRC) {
                handleNext();
                setLocaleQuiz({});
                setShowRC(false);
              } else {
                handleSubmitAndNext();
              }
            }}
          >
            {!showRC ? "Submit" : "Next"}
          </Button>
        ) : (
          <IconButton
            style={{ color: "#1976D2" }}
            disabled={isQuizCompleted}
            onClick={handleSubmitAndNext}
            className={isQuizCompleted ? "cursor-not-allowed" : ""}
          >
            <NavigateNextIcon
              style={{ height: "25px", width: "25px", borderRadius: "50%" }}
            />
          </IconButton>
        )}
      </Stack>
    </div>
  );
}

export default Quiz;
