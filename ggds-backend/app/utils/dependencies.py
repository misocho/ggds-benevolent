from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.utils.security import verify_token

# HTTP Bearer token scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user from JWT token

    Args:
        credentials: HTTP Authorization credentials containing the bearer token
        db: Database session

    Returns:
        User object

    Raises:
        HTTPException: If token is invalid or user not found
    """
    token = credentials.credentials
    print(f"🔑 DEBUG: Received token: {token[:20]}...")

    # Verify token
    payload = verify_token(token, token_type="access")
    print(f"🔍 DEBUG: Token payload: {payload}")
    if payload is None:
        print("❌ DEBUG: Token verification failed - payload is None")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user ID from payload
    user_id: str = payload.get("sub")
    print(f"👤 DEBUG: User ID from token: {user_id}")
    if user_id is None:
        print("❌ DEBUG: No user ID in token payload")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user from database
    user = db.query(User).filter(User.id == user_id).first()
    print(f"🗄️ DEBUG: User from DB: {user}")
    if user is None:
        print("❌ DEBUG: User not found in database")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        print("❌ DEBUG: User is inactive")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )

    print(f"✅ DEBUG: User authenticated successfully: {user.email}, role: {user.role}")
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to ensure the current user is active

    Args:
        current_user: Current user from get_current_user dependency

    Returns:
        Active user object

    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user


async def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to ensure the current user is an admin

    Args:
        current_user: Current user from get_current_user dependency

    Returns:
        Admin user object

    Raises:
        HTTPException: If user is not an admin
    """
    from app.models.user import UserRole
    print(f"🔐 DEBUG: Checking admin role - current_user.role: {current_user.role}, type: {type(current_user.role)}")
    print(f"🔐 DEBUG: UserRole.ADMIN: {UserRole.ADMIN}, type: {type(UserRole.ADMIN)}")
    print(f"🔐 DEBUG: Comparison result: {current_user.role != UserRole.ADMIN}")

    if current_user.role != UserRole.ADMIN:
        print(f"❌ DEBUG: Admin check failed - user role is {current_user.role}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )

    print("✅ DEBUG: Admin check passed")
    return current_user
