from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .auth import get_current_user
from .database import get_db
from .models import (
    Appointment,
    Message,
    Offer,
    Service,
    Stylist,
    User
)

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


@router.get("/overview")
def dashboard_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_appointments = db.query(
        Appointment
    ).count()

    pending_appointments = db.query(
        Appointment
    ).filter(
        Appointment.status == "pending"
    ).count()

    confirmed_appointments = db.query(
        Appointment
    ).filter(
        Appointment.status == "confirmed"
    ).count()

    unread_messages = db.query(
        Message
    ).filter(
        Message.is_read == False
    ).count()

    active_services = db.query(
        Service
    ).filter(
        Service.is_active == True
    ).count()

    active_stylists = db.query(
        Stylist
    ).filter(
        Stylist.is_active == True
    ).count()

    active_offers = db.query(
        Offer
    ).filter(
        Offer.is_active == True
    ).count()

    return {
        "totalAppointments": total_appointments,
        "pendingAppointments": pending_appointments,
        "confirmedAppointments": confirmed_appointments,
        "unreadMessages": unread_messages,
        "activeServices": active_services,
        "activeStylists": active_stylists,
        "activeOffers": active_offers
    }


@router.get("/activity")
def dashboard_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    week_ago = datetime.utcnow() - timedelta(days=7)

    bookings_this_week = db.query(
        Appointment
    ).filter(
        Appointment.created_at >= week_ago
    ).count()

    messages_this_week = db.query(
        Message
    ).filter(
        Message.created_at >= week_ago
    ).count()

    recent_bookings = db.query(
        Appointment
    ).order_by(
        Appointment.created_at.desc()
    ).limit(10).all()

    return {
        "bookingsThisWeek": bookings_this_week,
        "messagesThisWeek": messages_this_week,
        "recentBookings": [
            {
                "id": booking.id,
                "name": booking.full_name,
                "service": booking.service,
                "date": str(booking.date),
                "time": booking.time,
                "status": booking.status
            }
            for booking in recent_bookings
        ]
    }