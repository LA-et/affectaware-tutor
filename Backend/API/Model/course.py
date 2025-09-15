from .main import *
from datetime import datetime
from fastapi import Query

class CourseID(JWT):
    courseid: str = Field(..., description = "CourseID of a course", example = "PEKA7562")

class Submit(CourseID):
    testtype: str = Field(..., description = "Type of test", example = "PreTest")
    testid: Optional[str] = Field(None, description = "Test ID", example = "PK343542")
    questionid: Optional[str] = Field(None, description = "Type of test", example = "1")
    question: Optional[str] = Field(None, description = "Question", example = "What is your name?")
    answer: Optional[str] = Field(None, description = "Answer to the question", example = "B")
    moduleid: Optional[str] = Field(None, description = "Module ID", example = "1")
    quizid: Optional[str] = Field(None, description = "Quiz ID", example = "1")
    coursetype: Optional[str] = Field(None, description = "Course Type", example = "Remedial|Normal")
    content_type: Optional[str] = Field(None, description = "Content Type", example = "Video|Text|Image|Quiz")
