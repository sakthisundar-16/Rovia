from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timezone
import uuid

from app.auth.schemas import UserRegister, UserLogin, Token, TokenRefreshRequest
from app.users.models import User
from app.organizations.models import Organization
from app.common.enums import UserRole, OrganizationStatus
from app.common.exceptions import (
    InvalidCredentialsException,
    EmailAlreadyExistsException,
    InvalidTokenException
)
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token
)

class AuthService:
    @staticmethod
    async def register_user(db: AsyncSession, data: UserRegister) -> User:
        # Check if email exists
        result = await db.execute(select(User).where(User.email == data.email))
        if result.scalars().first():
            raise EmailAlreadyExistsException()
        
        # Check if org slug exists, if not create org
        result = await db.execute(select(Organization).where(Organization.slug == data.organization_slug))
        org = result.scalars().first()
        if not org:
            org = Organization(
                name=data.organization_name,
                slug=data.organization_slug,
                status=OrganizationStatus.ACTIVE
            )
            db.add(org)
            await db.flush()
        
        user = User(
            organization_id=org.id,
            email=data.email,
            password_hash=get_password_hash(data.password),
            first_name=data.first_name,
            last_name=data.last_name,
            role=UserRole.ADMIN  # First user registering an org gets ADMIN role
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def authenticate_user(db: AsyncSession, data: UserLogin) -> User:
        result = await db.execute(select(User).where(User.email == data.email))
        user = result.scalars().first()
        if not user or not verify_password(data.password, user.password_hash):
            raise InvalidCredentialsException()
        
        user.last_login_at = datetime.now(timezone.utc)
        await db.commit()
        return user

    @staticmethod
    async def refresh_token(db: AsyncSession, data: TokenRefreshRequest) -> Token:
        payload = decode_token(data.refresh_token, expected_type="refresh")
        user_id_str = payload.get("sub")
        
        result = await db.execute(select(User).where(User.id == user_id_str))
        user = result.scalars().first()
        if not user:
            raise InvalidTokenException()
            
        access_token = create_access_token(user.id, {"role": user.role.value, "org": str(user.organization_id)})
        refresh_token = create_refresh_token(user.id)
        
        return Token(access_token=access_token, refresh_token=refresh_token)
