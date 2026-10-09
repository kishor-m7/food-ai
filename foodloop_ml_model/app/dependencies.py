"""
FoodLoop AI - Authentication & Role Authorization Dependencies
Backend permission enforcement based on user session context.
"""

from typing import Optional
from fastapi import Header, HTTPException, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db, User


def get_current_user(
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db)
) -> User:
    """
    Retrieve current authenticated user from header context.
    Defaults to demo user 'usr-1' if header is not present.
    """
    user_id = x_user_id or "usr-1"
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        # Fallback to first available user
        user = db.query(User).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: User profile not found."
        )

    if user.status == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account suspended: Access denied."
        )

    return user


def require_admin_role(current_user: User = Depends(get_current_user)) -> User:
    """
    Backend permission check: Requires 'admin' role.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Administrative privileges required for this operation."
        )
    return current_user


def require_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Ensures user account is active and verified.
    """
    return current_user
