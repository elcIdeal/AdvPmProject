from fastapi import APIRouter, HTTPException, status, Request
from motor.motor_asyncio import AsyncIOMotorClient
from ..config import Settings
from pydantic import BaseModel

router = APIRouter()
settings = Settings()

class UserProfile(BaseModel):
    email: str
    name: str
    picture: str

@router.post("/register")
async def register_user(request: Request, user: UserProfile):
    try:
        # Check if user already exists
        existing_user = await request.app.mongodb["users"].find_one({"email": user.email})
        if existing_user:
            return {"message": "User already registered"}

        # Create new user document
        user_doc = {
            "email": user.email,
            "name": user.name,
            "picture": user.picture,
            "created_at": datetime.utcnow()
        }
        
        await request.app.mongodb["users"].insert_one(user_doc)
        return {"message": "User registered successfully"}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/profile")
async def get_user_profile(request: Request, current_user = Depends(get_current_user)):
    try:
        user = await request.app.mongodb["users"].find_one({"email": current_user["email"]})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserProfile(
            email=user["email"],
            name=user["name"],
            picture=user["picture"]
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )