from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

# =========================
# AUTH
# =========================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# =========================
# APPOINTMENTS
# =========================

class AppointmentCreate(BaseModel):
    fullName: str = Field(min_length=2, max_length=150)
    phone: str = Field(min_length=10, max_length=30)
    email: Optional[EmailStr] = None
    service: str = Field(min_length=1, max_length=200)
    stylist: Optional[str] = None
    date: date
    time: str = Field(min_length=1, max_length=50)
    notes: Optional[str] = None
    consent: bool

class AppointmentResponse(BaseModel):
    id: int
    full_name: str
    phone: str
    email: Optional[str]
    service: str
    stylist: Optional[str]
    date: date
    time: str
    notes: Optional[str]
    consent: bool
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class AppointmentStatusUpdate(BaseModel):
    status: str

# =========================
# MESSAGES
# =========================

class MessageCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    phone: Optional[str] = None
    message: str = Field(min_length=1)

class MessageResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    message: str
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True

# =========================
# SERVICES
# =========================

class ServiceCreate(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    duration: Optional[str] = None
    price: str
    is_active: bool = True

class ServiceResponse(ServiceCreate):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# =========================
# STYLISTS
# =========================

class StylistCreate(BaseModel):
    name: str
    specialty: str
    experience: Optional[str] = None
    bio: Optional[str] = None
    image: Optional[str] = None
    is_active: bool = True

class StylistResponse(StylistCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# =========================
# OFFERS
# =========================

class OfferCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price: str
    badge: Optional[str] = None
    features: Optional[str] = None
    is_active: bool = True

class OfferResponse(OfferCreate):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True