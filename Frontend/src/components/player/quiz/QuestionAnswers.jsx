import React, { useEffect, useState } from "react";
import {
  Box,
  Radio,
  FormControlLabel,
  RadioGroup,
  Divider,
} from "@mui/material";
import { FaCheck, FaTimes } from "react-icons/fa";
import useEventLogger from "../../../hooks/eventLogger";

const ProgressBar = ({ progress }) => (
  <Box
    sx={{
      width: "100%",
      height: "8px",
      backgroundColor: "#e0e0e0",
      borderRadius: "4px",
    }}
  >
    <Box
      sx={{
        height: "100%",
        width: `${progress}%`,
        backgroundColor: "#1976d2",
        borderRadius: "4px",
      }}
    />
  </Box>
);

function QuestionAnswers({
  quiz,
  currentQuestionIndex,
  handleAnswerSelect,
  showRC,
  explanationData,
  answerSelect,
  correctAnswer,
  isCorrect,
  localeQuiz,
}) {
  const [selectedAnswer, setSelectedAnswer] = useState(answerSelect);
  const currentOptions = localeQuiz?.Options;
  const questionText = localeQuiz?.Question;
  const logEvent = useEventLogger();

  useEffect(() => {
    if (!showRC) {
      setSelectedAnswer("");
    }
  }, [showRC]);

  useEffect(() => {
    if (localeQuiz?.Question) {
      console.log("New question loaded into localeQuiz:", localeQuiz.Question);
    }
  }, [localeQuiz]);

  return (
    <>
      <Box
        style={{
          paddingTop: "9px",
          width: "500px",
          overflowY: showRC ? "hidden" : "unset",
        }}
      >
        <div className="text-center text-gray-700 my-2">
          Question {localeQuiz?.Question_Number} of{" "}
          {localeQuiz?.Total_Questions}
        </div>
        <div className="mb-8">
          <ProgressBar
            progress={
              localeQuiz?.Total_Questions
                ? (localeQuiz.Question_Number / localeQuiz.Total_Questions) * 100
                : 0
            }
          />
        </div>
        <div className="my-4">
          <Divider orientation="horizontal" flexItem />
        </div>
        <p className="font-bold">
          {localeQuiz?.Question_Number}) {questionText}
        </p>
        <RadioGroup
          value={selectedAnswer}
          onChange={(event) => {
            const selected = event.target.value;
            setSelectedAnswer(selected);
            handleAnswerSelect(quiz?.QuizID, selected);
            logEvent({
              action: "Select Answer",
              details: {
                quizId: quiz?.QuizID,
                questionNumber: localeQuiz?.Question_Number,
                question: localeQuiz?.Question,
                selectAnswer: selected,
                moduleID: localeQuiz.ModuleID,
                moduleTitle: localeQuiz.Module_Name,
                ContentType: localeQuiz.Content_Type,
                CourseID: localeQuiz.CourseID,
                CourseTitle: localeQuiz.Course_Title,
                CourseType: localeQuiz.Course_Type,
              },
            });
          }}
        >
          {currentOptions && currentOptions?.map((option, index) => {
            const isSelected = option === selectedAnswer;
            const isOptionCorrect = option === correctAnswer;
            return (
              <FormControlLabel
                key={index}
                className="font-medium"
                value={option}
                control={<Radio />}
                disabled={showRC}
                label={
                  <div className="flex justify-between items-center">
                    <span
                      style={{
                        color: showRC
                          ? isSelected
                            ? isOptionCorrect
                              ? "green"
                              : "red"
                            : isOptionCorrect
                            ? "green"
                            : "initial"
                          : "black",
                      }}
                    >
                      {option}
                    </span>
                    {showRC && (
                      <div className="ml-2">
                        {isSelected && isOptionCorrect && (
                          <FaCheck style={{ color: "green" }} />
                        )}
                        {isSelected && !isOptionCorrect && (
                          <FaTimes style={{ color: "red" }} />
                        )}
                        {!isSelected && isOptionCorrect && (
                          <FaCheck style={{ color: "green" }} />
                        )}
                      </div>
                    )}
                  </div>
                }
              />
            );
          })}
        </RadioGroup>

        {showRC && (
          <>
            <p
              className="text-xs font-medium"
              style={{ padding: "15px 0px 30px 0px" }}
            >
              <strong>Explanation:</strong> {explanationData}
            </p>
          </>
        )}
      </Box>
    </>
  );
}

export default QuestionAnswers;
