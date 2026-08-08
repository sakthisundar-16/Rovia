from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.auth.schemas import Token, UserRegister, UserResponse, TokenRefreshRequest, UserLogin
from app.auth.service import AuthService
from app.common.dependencies import get_current_active_user
from app.users.models import User
from app.core.security import create_access_token, create_refresh_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    return await AuthService.register_user(db, data)

@router.post("/login", response_model=Token)
async def login(data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await AuthService.authenticate_user(db, UserLogin(email=data.username, password=data.password))
    access_token = create_access_token(user.id, {"role": user.role.value, "org": str(user.organization_id)})
    refresh_token = create_refresh_token(user.id)
    return Token(access_token=access_token, refresh_token=refresh_token)

@router.post("/refresh", response_model=Token)
async def refresh(data: TokenRefreshRequest, db: AsyncSession = Depends(get_db)):
    return await AuthService.refresh_token(db, data)

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_active_user)):
    # Basic JWT logout typically handled on client side by deleting token.
    # To implement server-side invalidation, we would need a token blacklist in Redis.
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user
