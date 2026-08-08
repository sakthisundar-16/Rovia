from pydantic import BaseModel, EmailStr
from uuid import UUID

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenRefreshRequest(BaseModel):
    refresh_token: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    organization_name: str
    organization_slug: str

class UserResponse(BaseModel):
    id: UUID
    organization_id: UUID
    email: EmailStr
    first_name: str
    last_name: str
    role: str
    is_active: bool

    model_config = {"from_attributes": True}
