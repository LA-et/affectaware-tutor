from pydantic import BaseModel, Field
from typing import Optional

class JWT(BaseModel):
    jwt: str = Field(..., description = "JWT for the user", example = "vtuoe[hqj[requ9[rbe9b9[tbqjrbiej[e]]]]]")

class Username(BaseModel):
    username: str = Field(..., description = "Username", example = "Jinx")

class Email(BaseModel):
    email: str = Field(..., description = "Email of the User", example = "example@example.com")

class Log(JWT):
    action: str = Field(..., description = "Action performed by the user", example = "Logged In")
    details: Optional[dict] = Field(None, description = "Details of the action", example = {"CourseID": "PEKA7562", "ModuleID": "1", "QuizID": "1"})