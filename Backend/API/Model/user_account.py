from .main import *
from fastapi import File, UploadFile

class Update_Password(JWT):
    old_password: str = Field(..., description = "Old Password of the username", example = "password123")
    new_password: str = Field(..., description = "New Password of the username", example = "password123")
    con_password: str = Field(..., description = "Confirm Password of the username", example = "password123")

class Profile_Image(JWT):
    profile_image: str = Field(..., description = "Profile Image of the user", example = "image/pro.jpg")

class Page(Username):
    page: str = Field(..., description = "Page of the application", example = "Email Verification | Forgot Password")

class Register(Username, Email):
    name: str = Field(..., description = "Name of the user", example = "George")
    password: str = Field(..., description = "Password of the username", example = "password123")
    con_password: str = Field(..., description = "Confirm Password of the username", example = "password123")
    grade: str = Field(..., description = "Grade of the user", example = "1")
    institute: str = Field(..., description = "Institution of the user", example = "IITB")

class Login(Username):
    password: str = Field(..., description = "Password of the username", example = "password123")

