"""OAuth and Authentication routes for external platforms."""
import json
import logging
from datetime import datetime
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import RedirectResponse
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
import httpx

from app.api.deps import get_current_user, get_optional_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models import ConnectedAccount, User

logger = logging.getLogger(__name__)

router = APIRouter()

# These should ideally come from settings (e.g. settings.GMAIL_CLIENT_ID)
# but we will read them dynamically or expect them in the environment.
# DO NOT HARDCODE SECRETS.
GMAIL_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GMAIL_TOKEN_URL = "https://oauth2.googleapis.com/token"

@router.get("/gmail/login")
async def gmail_login(
    current_user: User = Depends(get_current_user),
):
    """Initiate Gmail OAuth 2.0 flow."""
    # Note: Client ID must be provided in environment variables
    client_id = getattr(settings, "GMAIL_CLIENT_ID", None)
    if not client_id or client_id == "your_gmail_client_id":
        raise HTTPException(status_code=500, detail="Gmail OAuth is not configured on the server.")

    redirect_uri = f"{settings.BACKEND_CORS_ORIGINS[0] if settings.BACKEND_CORS_ORIGINS else 'http://localhost:8000'}/api/auth/gmail/callback"
    
    # State should ideally be a JWT containing user_id to prevent CSRF
    state = str(current_user.id)
    
    scope = "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email"
    
    auth_url = (
        f"{GMAIL_AUTH_URL}?"
        f"client_id={client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"response_type=code&"
        f"scope={scope}&"
        f"access_type=offline&"
        f"prompt=consent&"
        f"state={state}"
    )
    
    return {"auth_url": auth_url}


@router.get("/gmail/callback")
async def gmail_callback(
    request: Request,
    code: str,
    state: str,
    db: AsyncSession = Depends(get_db),
):
    """Handle Gmail OAuth 2.0 callback."""
    client_id = getattr(settings, "GMAIL_CLIENT_ID", None)
    client_secret = getattr(settings, "GMAIL_CLIENT_SECRET", None)
    
    if not client_id or not client_secret:
        raise HTTPException(status_code=500, detail="Gmail OAuth is not configured on the server.")
        
    redirect_uri = f"{settings.BACKEND_CORS_ORIGINS[0] if settings.BACKEND_CORS_ORIGINS else 'http://localhost:8000'}/api/auth/gmail/callback"
    
    # Exchange code for token
    async with httpx.AsyncClient() as client:
        response = await client.post(
            GMAIL_TOKEN_URL,
            data={
                "client_id": client_id,
                "client_secret": client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": redirect_uri,
            },
        )
        
        if response.status_code != 200:
            logger.error(f"Failed to get Gmail token: {response.text}")
            raise HTTPException(status_code=400, detail="Failed to authenticate with Google.")
            
        token_data = response.json()
        
    # Get user email
    async with httpx.AsyncClient() as client:
        userinfo_resp = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {token_data['access_token']}"}
        )
        user_email = userinfo_resp.json().get("email", "unknown@gmail.com")

    # In a real app, state should be decoded and verified. Here we assume state is user_id.
    try:
        user_id = int(state)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid state parameter.")

    # Save connected account
    res = await db.execute(
        select(ConnectedAccount).where(
            and_(ConnectedAccount.user_id == user_id, ConnectedAccount.platform == "gmail")
        )
    )
    account = res.scalar_one_or_none()
    
    if not account:
        account = ConnectedAccount(
            user_id=user_id,
            platform="gmail",
            is_connected=True,
            account_email=user_email,
            connected_at=datetime.utcnow(),
            token_data=json.dumps(token_data)
        )
        db.add(account)
    else:
        account.is_connected = True
        account.account_email = user_email
        account.connected_at = datetime.utcnow()
        account.token_data = json.dumps(token_data)
        account.updated_at = datetime.utcnow()
        
    await db.commit()
    
    # Redirect back to frontend integrations page
    frontend_url = "http://localhost:3000/integrations"
    return RedirectResponse(url=f"{frontend_url}?success=gmail")


@router.get("/accounts")
async def get_connected_accounts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get status of all connected accounts for the user."""
    res = await db.execute(
        select(ConnectedAccount).where(ConnectedAccount.user_id == current_user.id)
    )
    accounts = res.scalars().all()
    
    return [
        {
            "platform": acc.platform,
            "is_connected": acc.is_connected,
            "account_email": acc.account_email,
            "connected_at": acc.connected_at.isoformat() if acc.connected_at else None,
        }
        for acc in accounts
    ]
