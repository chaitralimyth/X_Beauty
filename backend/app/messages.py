from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .auth import get_current_user
from .database import get_db
from .models import Message, User
from .schemas import MessageCreate, MessageResponse

router = APIRouter(
    prefix="/api/messages",
    tags=["Messages"]
)


@router.post(
    "",
    response_model=MessageResponse
)
def create_message(
    message_data: MessageCreate,
    db: Session = Depends(get_db)
):
    message = Message(
        name=message_data.name,
        email=message_data.email,
        phone=message_data.phone,
        message=message_data.message,
        is_read=False
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message


@router.get(
    "",
    response_model=list[MessageResponse]
)
def get_messages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(
        Message
    ).order_by(
        Message.created_at.desc()
    ).all()


@router.patch(
    "/{message_id}/read",
    response_model=MessageResponse
)
def mark_message_read(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    message = db.query(
        Message
    ).filter(
        Message.id == message_id
    ).first()

    if not message:
        raise HTTPException(
            status_code=404,
            detail="Message not found"
        )

    message.is_read = True

    db.commit()
    db.refresh(message)

    return message