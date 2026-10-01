from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User
from app.schemas.schemas import UserCreate, UserLogin, UserResponse, Token
from app.core.security import verify_password, get_password_hash, create_access_token
from app.api.deps import require_authenticated_user

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        (User.username == user_in.username) | (User.email == user_in.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role.upper(),
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == credentials.username).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")
    
    token = create_access_token(subject=user.username, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(require_authenticated_user)):
    return current_user

@router.post("/demo-switch-role", response_model=Token)
def demo_switch_role(role_name: str, db: Session = Depends(get_db)):
    """
    Hackathon convenience endpoint: switch into any role session instantly
    (SUPER_ADMIN, ELECTION_AUTHORITY, VALIDATOR, AUDITOR, CITIZEN)
    """
    role = role_name.upper()
    valid_roles = ["SUPER_ADMIN", "ELECTION_AUTHORITY", "VALIDATOR", "AUDITOR", "CITIZEN"]
    if role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Choose from {valid_roles}")
    
    username = f"demo_{role.lower()}"
    user = db.query(User).filter(User.username == username).first()
    if not user:
        user = User(
            username=username,
            email=f"{username}@qaudit.gov",
            hashed_password=get_password_hash("password123"),
            role=role,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    token = create_access_token(subject=user.username, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username
    }
