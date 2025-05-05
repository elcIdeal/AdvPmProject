from pydantic import BaseModel, EmailStr

class User(BaseModel):
    email: EmailStr
    password: str


class RegisterUser(BaseModel):
    email: EmailStr
    password: str
    name: str
    picture: str = ""

