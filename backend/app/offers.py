from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .auth import get_current_user
from .database import get_db
from .models import Offer, User
from .schemas import OfferCreate, OfferResponse

router = APIRouter(
    prefix="/api/offers",
    tags=["Offers"]
)


@router.get(
    "",
    response_model=list[OfferResponse]
)
def get_offers(
    db: Session = Depends(get_db)
):
    return db.query(
        Offer
    ).filter(
        Offer.is_active == True
    ).all()


@router.get(
    "/admin",
    response_model=list[OfferResponse]
)
def get_all_offers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Offer).all()


@router.post(
    "",
    response_model=OfferResponse
)
def create_offer(
    offer_data: OfferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    offer = Offer(
        title=offer_data.title,
        description=offer_data.description,
        price=offer_data.price,
        badge=offer_data.badge,
        features=offer_data.features,
        is_active=offer_data.is_active
    )

    db.add(offer)
    db.commit()
    db.refresh(offer)

    return offer


@router.put(
    "/{offer_id}",
    response_model=OfferResponse
)
def update_offer(
    offer_id: int,
    offer_data: OfferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    offer = db.query(
        Offer
    ).filter(
        Offer.id == offer_id
    ).first()

    if not offer:
        raise HTTPException(
            status_code=404,
            detail="Offer not found"
        )

    offer.title = offer_data.title
    offer.description = offer_data.description
    offer.price = offer_data.price
    offer.badge = offer_data.badge
    offer.features = offer_data.features
    offer.is_active = offer_data.is_active

    db.commit()
    db.refresh(offer)

    return offer


@router.delete(
    "/{offer_id}"
)
def delete_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    offer = db.query(
        Offer
    ).filter(
        Offer.id == offer_id
    ).first()

    if not offer:
        raise HTTPException(
            status_code=404,
            detail="Offer not found"
        )

    db.delete(offer)
    db.commit()

    return {
        "message": "Offer deleted successfully"
    }