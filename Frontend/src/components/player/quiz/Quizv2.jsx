import { useEffect, useState } from "react";
import { Button, Stack, IconButton } from "@mui/material";
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
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCompletionStatusCalled, setIsCompletionStatusCalled] = useState(false);

  const navigate = useNavigate();
  const course_id = useParams().id;
  const jwt = localStorage.getItem("JWT");
  const sendRequest = useHttpRequest();
  const logEvent = useEventLogger();

  const localeQuestion = localeQuiz?.Question;

  const handleSubmitAndNext = async () => {
    setShowRC(true);
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

        const message = completionResponse?.Success?.Message || "Operation successful";
        dispatchMessage("success", message);
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

        if (courseQueueResponse?.Success) {
          const message = courseQueueResponse?.Success?.Message;
          getUserLog(courseQueueResponse.Success.Content_Type);

          if (message === "Quiz completed successfully!") {
            Swal.fire({
              title: message,
              text: `Your score: ${courseQueueResponse?.Success?.Score.toFixed(2)} / ${courseQueueResponse?.Success?.Outof}`,
              icon: "success",
              confirmButtonText: "OK",
              customClass: { confirmButton: "bg-blue-500 text-white" },
              willClose: async () => {
                setIsQuizCompleted(true);

                const newQueueRes = await apiResponse(
                  "/course/course_queue",
                  "POST",
                  {
                    jwt,
                    courseid: localeQuiz.CourseID,
                  }
                );

                const result = newQueueRes?.Success;
                sethittype(result);

                if (result === "Modules completed successfully!") {
                  await Swal.fire({
                    title: "Modules Completed!",
                    text: result,
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

                  const { Question, Success } = finalResponse;

                  if (Question?.TestType === "PreTest" || Question?.TestType === "PostTest") {
                    navigate("/form", { state: { questionData: Question } });
                  } else if (Success?.TestType === "Modules") {
                    navigate("/modules", { state: { moduleData: Success } });
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
          console.error("Unexpected response: No 'Success' key in courseQueueResponse");
        }
      }
    } catch (error) {
      console.error("Submission Error:", error);
      Swal.fire({
        title: "Error",
        text: "Something went wrong during submission. Please try again.",
        icon: "error",
      });
    }
  };

  const handleAnswerSelect = (id, answer) => {
    setIsAnswered(true);
    setSelectedAnswer(answer);

    setLocaleQuiz((prevState) => {
      const updated = { ...prevState };
      if (Array.isArray(updated.Question)) {
        updated.Question = updated.Question.map((q) =>
          q.Question === id
            ? { ...q, Answer: answer, Correct_Answer: answer === q.correctAnswer }
            : q
        );
      }
      return updated;
    });
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (loading) return <Loader height="400px" />;

  const isLastQuestion = currentQuestionIndex === quiz?.Question.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  return (
    <div style={{ padding: "20px", display: "flex", alignItems: "center", flexDirection: "column" }}>
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
          <NavigateBeforeIcon style={{ height: "25px", width: "25px", borderRadius: "50%" }} />
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
            <NavigateNextIcon style={{ height: "25px", width: "25px", borderRadius: "50%" }} />
          </IconButton>
        )}
      </Stack>
    </div>
  );
}

export default Quiz;
