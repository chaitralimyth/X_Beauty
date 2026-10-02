from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

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


@router.get(
    "/{booking_id}",
    response_model=AppointmentResponse
)
def get_booking(
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