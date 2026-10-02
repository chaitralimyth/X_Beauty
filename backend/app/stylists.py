from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .auth import get_current_user
from .database import get_db
from .models import Stylist, User
from .schemas import StylistCreate, StylistResponse

router = APIRouter(
    prefix="/api/stylists",
    tags=["Stylists"]
)


@router.get(
    "",
    response_model=list[StylistResponse]
)
def get_stylists(
    db: Session = Depends(get_db)
):
    return db.query(
        Stylist
    ).filter(
        Stylist.is_active == True
    ).all()


@router.get(
    "/admin",
    response_model=list[StylistResponse]
)
def get_all_stylists(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Stylist).all()


@router.post(
    "",
    response_model=StylistResponse
)
def create_stylist(
    stylist_data: StylistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stylist = Stylist(
        name=stylist_data.name,
        specialty=stylist_data.specialty,
        experience=stylist_data.experience,
        bio=stylist_data.bio,
        image=stylist_data.image,
        is_active=stylist_data.is_active
    )

    db.add(stylist)
    db.commit()
    db.refresh(stylist)

    return stylist


@router.put(
    "/{stylist_id}",
    response_model=StylistResponse
)
def update_stylist(
    stylist_id: int,
    stylist_data: StylistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stylist = db.query(
        Stylist
    ).filter(
        Stylist.id == stylist_id
    ).first()

    if not stylist:
        raise HTTPException(
            status_code=404,
            detail="Stylist not found"
        )

    stylist.name = stylist_data.name
    stylist.specialty = stylist_data.specialty
    stylist.experience = stylist_data.experience
    stylist.bio = stylist_data.bio
    stylist.image = stylist_data.image
    stylist.is_active = stylist_data.is_active

    db.commit()
    db.refresh(stylist)

    return stylist


@router.delete(
    "/{stylist_id}"
)
def delete_stylist(
    stylist_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stylist = db.query(
        Stylist
    ).filter(
        Stylist.id == stylist_id
    ).first()

    if not stylist:
        raise HTTPException(
            status_code=404,
            detail="Stylist not found"
        )

    db.delete(stylist)
    db.commit()

    return {
        "message": "Stylist deleted successfully"
    }