from fastapi import APIRouter, Request, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime
import bcrypt
from ..models.user import User, RegisterUser  # ← используем этот класс

router = APIRouter()

@router.post("/register")
async def register_user(request: Request, user: RegisterUser):
    users_collection = request.app.mongodb["users"]

    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_pw = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()

    new_user = {
        "email": user.email,
        "password": hashed_pw,
        "name": user.name,
        "picture": user.picture,
        "created_at": datetime.utcnow()
    }

    await users_collection.insert_one(new_user)
    return {"message": "User registered successfully"}


@router.post("/login")
async def login_user(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    users_collection = request.app.mongodb["users"]

    user = await users_collection.find_one({"email": form_data.username})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if not bcrypt.checkpw(form_data.password.encode(), user["password"].encode()):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    return {"message": "Login successful"}
