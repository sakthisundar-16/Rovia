from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Annotated

from app.core.database import get_db
from app.core.security import decode_token
from app.users.models import User
from app.common.enums import UserRole
from app.common.exceptions import (
    InvalidTokenException, 
    UserNotFoundException, 
    AccountDisabledException, 
    ForbiddenException,
    TenantAccessDeniedException
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: AsyncSession = Depends(get_db)) -> User:
    payload = decode_token(token, expected_type="access")
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise InvalidTokenException()
    
    result = await db.execute(select(User).where(User.id == user_id_str))
    user = result.scalars().first()
    if not user:
        raise UserNotFoundException()
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise AccountDisabledException()
    return current_user

async def require_admin(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise ForbiddenException()
    return current_user

async def require_operations(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.OPERATIONS]:
        raise ForbiddenException()
    return current_user

def require_tenant(organization_id: str):
    def tenant_checker(current_user: User = Depends(get_current_active_user)):
        if str(current_user.organization_id) != str(organization_id):
            raise TenantAccessDeniedException()
        return current_user
    return tenant_checker
