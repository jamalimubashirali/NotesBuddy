from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import traceback
from app.core.database import get_db
from app.core.auth import create_access_token, verify_token
from app.core.config import settings
from app.models.user_pref_model import UserCreate, UserResponse, UserLogin, Token, TokenData
from app.services.user_service import UserService

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user.
    
    - **email**: Valid email address
    - **username**: Unique username
    - **password**: Strong password
    - **full_name**: Optional full name
    """
    try:
        db_user = UserService.create_user(db=db, user=user)
        return UserResponse.from_orm(db_user)
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR registering user: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )


@router.post("/login", response_model=Token)
async def login_user(
    user_credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Login user and return access token.
    
    - **email**: User's email address
    - **password**: User's password
    """
    user = UserService.authenticate_user(
        db=db, 
        email=user_credentials.email, 
        password=user_credentials.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def read_current_user(
    token_data: TokenData = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """
    Get current user information.
    Requires authentication token.
    """
    user = UserService.get_user_by_email(db=db, email=token_data.email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return UserResponse.from_orm(user)


@router.post("/verify-token")
async def verify_user_token(
    token_data: TokenData = Depends(verify_token)
):
    """
    Verify if the provided token is valid.
    """
    return {"message": "Token is valid", "email": token_data.email}