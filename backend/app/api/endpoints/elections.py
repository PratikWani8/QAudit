from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Election, User
from app.schemas.schemas import ElectionCreate, ElectionResponse, ElectionLockResponse
from app.services.election_service import ElectionService
from app.api.deps import get_current_user, require_role

router = APIRouter()

@router.post("", response_model=ElectionResponse, status_code=status.HTTP_201_CREATED)
def create_election(
    election_in: ElectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["SUPER_ADMIN", "ELECTION_AUTHORITY"]))
):
    try:
        election = ElectionService.create_election(db, election_in)
        return election
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=List[ElectionResponse])
def list_elections(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    elections = db.query(Election).offset(skip).limit(limit).all()
    return elections

@router.get("/{election_id}", response_model=ElectionResponse)
def get_election(election_id: str, db: Session = Depends(get_db)):
    election = db.query(Election).filter(Election.election_id == election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    return election

@router.post("/{election_id}/lock", response_model=ElectionLockResponse)
def lock_election(
    election_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["SUPER_ADMIN", "ELECTION_AUTHORITY"]))
):
    try:
        lock_res = ElectionService.lock_election(db, election_id)
        return lock_res
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{election_id}/verify")
def verify_election_config(election_id: str, db: Session = Depends(get_db)):
    try:
        verification = ElectionService.verify_election_config(db, election_id)
        return verification
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
