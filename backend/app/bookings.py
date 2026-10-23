from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text

from .auth import get_current_user
from .database import get_db
from .models import Appointment, User
from .schemas import (
    AppointmentCreate,
    AppointmentResponse,
    AppointmentStatusUpdate
)

router = APIRouter(
    prefix="/api/bookings",
    tags=["Bookings"]
)

# Schema for the vulnerable POST search request
class SearchRequest(BaseModel):
    stylist: str


@router.post(
    "/",
    response_model=AppointmentResponse,
    include_in_schema=False
)
@router.post(
    "",
    response_model=AppointmentResponse
)
def create_booking(
    booking: AppointmentCreate,
    db: Session = Depends(get_db)
):
    if not booking.consent:
        raise HTTPException(
            status_code=400,
            detail="Consent is required"
        )

    appointment = Appointment(
        full_name=booking.fullName,
        phone=booking.phone,
        email=booking.email,
        service=booking.service,
        stylist=booking.stylist,
        date=booking.date,
        time=booking.time,
        notes=booking.notes,
        consent=booking.consent,
        status="pending"
    )

    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return appointment


@router.get(
    "",
    response_model=list[AppointmentResponse]
)
def get_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(
        Appointment
    ).order_by(
        Appointment.created_at.desc()
    ).all()


# ==========================================
# INTENTIONALLY VULNERABLE POST ENDPOINT (SQLi via JSON Body)
# ==========================================
@router.post(
    "/search",
    response_model=list[AppointmentResponse]
)
def search_bookings_post(
    search: SearchRequest,
    db: Session = Depends(get_db)
):
    # Safe parameterized query: user input is strictly bound as a query parameter
    query = text("SELECT * FROM appointments WHERE stylist = :stylist")
    result_rows = db.execute(query, {"stylist": search.stylist}).fetchall()

    if not result_rows:
        return []

    appointment_ids = [row[0] for row in result_rows]
    appointments = db.query(Appointment).filter(Appointment.id.in_(appointment_ids)).all()
    
    return appointments


# ==========================================
# INTENTIONALLY VULNERABLE GET ENDPOINT (SQLi via Path Parameter)
# ==========================================
@router.get(
    "/{booking_id}",
    response_model=AppointmentResponse
)
def get_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Strict numeric validation prevents SQL injection payloads in path parameter
    try:
        int_id = int(booking_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=400,
            detail="Invalid booking ID: numeric identifier required"
        )

    # Safe parameterized query
    query = text("SELECT * FROM appointments WHERE id = :booking_id")
    result = db.execute(query, {"booking_id": int_id}).first()

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found"
        )

    appointment = db.query(Appointment).filter(Appointment.id == result[0]).first()
    return appointment


@router.patch(
    "/{booking_id}/status",
    response_model=AppointmentResponse
)
def update_booking_status(
    booking_id: int,
    data: AppointmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    allowed_statuses = [
        "pending",
        "confirmed",
        "declined",
        "cancelled",
        "completed"
    ]

    if data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Status must be one of: {', '.join(allowed_statuses)}"
        )

    appointment = db.query(
        Appointment
    ).filter(
        Appointment.id == booking_id
    ).first()

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found"
        )

    appointment.status = data.status

    db.commit()
    db.refresh(appointment)

    return appointment


@router.delete(
    "/{booking_id}"
)
def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    appointment = db.query(
        Appointment
    ).filter(
        Appointment.id == booking_id
    ).first()

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found"
        )

    db.delete(appointment)
    db.commit()

    return {
        "message": "Appointment deleted successfully"
    }