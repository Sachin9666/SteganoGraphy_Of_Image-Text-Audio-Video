from fastapi import APIRouter, Depends, HTTPException, status

from backend.schemas.auth import AuthResponse, UserCreate, UserLogin, UserProfile
from backend.services.auth import create_access_token, get_current_user
from backend.services.user_service import authenticate_user, create_user, get_user_by_id

router = APIRouter(tags=["auth"])


@router.post("/auth/register", response_model=AuthResponse)
async def register_user(payload: UserCreate) -> dict:
    try:
        user = create_user(payload.email, payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    token = create_access_token(user["id"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user["id"],
        "email": user["email"],
    }


@router.post("/auth/login", response_model=AuthResponse)
async def login_user(payload: UserLogin) -> dict:
    user = authenticate_user(payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(user["id"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user["id"],
        "email": user["email"],
    }


@router.get("/auth/me", response_model=UserProfile)
async def current_user(current_user: dict = Depends(get_current_user)) -> dict:
    return current_user
