from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .auth import get_current_user
from .database import get_db
from .models import Service, User
from .schemas import ServiceCreate, ServiceResponse

router = APIRouter(
    prefix="/api/services",
    tags=["Services"]
)


@router.get(
    "",
    response_model=list[ServiceResponse]
)
def get_services(
    db: Session = Depends(get_db)
):
    return db.query(
        Service
    ).filter(
        Service.is_active == True
    ).all()


@router.get(
    "/admin",
    response_model=list[ServiceResponse]
)
def get_all_services(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Service).all()


@router.post(
    "",
    response_model=ServiceResponse
)
def create_service(
    service_data: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = Service(
        name=service_data.name,
        category=service_data.category,
        description=service_data.description,
        duration=service_data.duration,
        price=service_data.price,
        is_active=service_data.is_active
    )

    db.add(service)
    db.commit()
    db.refresh(service)

    return service


@router.put(
    "/{service_id}",
    response_model=ServiceResponse
)
def update_service(
    service_id: int,
    service_data: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = db.query(
        Service
    ).filter(
        Service.id == service_id
    ).first()

    if not service:
        raise HTTPException(
            status_code=404,
            detail="Service not found"
        )

    service.name = service_data.name
    service.category = service_data.category
    service.description = service_data.description
    service.duration = service_data.duration
    service.price = service_data.price
    service.is_active = service_data.is_active

    db.commit()
    db.refresh(service)

    return service


@router.delete(
    "/{service_id}"
)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = db.query(
        Service
    ).filter(
        Service.id == service_id
    ).first()

    if not service:
        raise HTTPException(
            status_code=404,
            detail="Service not found"
        )

    db.delete(service)
    db.commit()

    return {
        "message": "Service deleted successfully"
    }