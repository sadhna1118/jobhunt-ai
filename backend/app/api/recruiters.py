"""Recruiter CRM endpoints."""
import logging
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models import CandidateProfile, Message, Recruiter, RecruiterStatusEnum, User
from app.schemas import MessageCreate, MessageResponse, RecruiterResponse, RecruiterUpdate
from app.services.deduplicator import recruiter_deduplicator
from app.services.message_generator import message_generator

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/")
async def list_recruiters(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List recruiters in the CRM."""
    query = select(Recruiter).where(Recruiter.user_id == current_user.id)

    if status and status != "all":
        query = query.where(Recruiter.status == status)

    query = query.order_by(Recruiter.updated_at.desc())
    res = await db.execute(query)
    recruiters = res.scalars().all()

    return [
        {
            "id": r.id,
            "name": r.name,
            "email": r.email,
            "phone": r.phone,
            "company": r.company,
            "role": r.role,
            "platform": r.platform,
            "profile_url": r.profile_url,
            "platform_id": r.platform_id,
            "status": r.status,
            "first_contact_date": r.first_contact_date.isoformat() if r.first_contact_date else None,
            "last_contact_date": r.last_contact_date.isoformat() if r.last_contact_date else None,
            "total_contacts": r.total_contacts,
            "response_date": r.response_date.isoformat() if r.response_date else None,
            "notes": r.notes,
        }
        for r in recruiters
    ]


@router.get("/status/contacted")
async def get_contacted_recruiters(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all recruiters who have already been contacted."""
    query = select(Recruiter).where(
        and_(
            Recruiter.user_id == current_user.id,
            Recruiter.status.in_(["contacted", "replied", "interested", "interview"])
        )
    ).order_by(Recruiter.last_contact_date.desc())
    res = await db.execute(query)
    recruiters = res.scalars().all()
    return recruiters


@router.get("/{recruiter_id}")
async def get_recruiter(
    recruiter_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed recruiter CRM record."""
    res = await db.execute(
        select(Recruiter).where(and_(Recruiter.id == recruiter_id, Recruiter.user_id == current_user.id))
    )
    rec = res.scalar_one_or_none()
    if not rec:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    return rec


@router.put("/{recruiter_id}")
async def update_recruiter(
    recruiter_id: int,
    payload: RecruiterUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update recruiter status, notes, or Do Not Contact flag."""
    res = await db.execute(
        select(Recruiter).where(and_(Recruiter.id == recruiter_id, Recruiter.user_id == current_user.id))
    )
    rec = res.scalar_one_or_none()
    if not rec:
        raise HTTPException(status_code=404, detail="Recruiter not found")

    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        if v is not None:
            setattr(rec, k, v)

    rec.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(rec)
    return {"message": "Recruiter updated", "id": rec.id, "status": rec.status}


@router.get("/{recruiter_id}/messages")
async def get_recruiter_messages(
    recruiter_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get outreach message history for a recruiter."""
    res = await db.execute(
        select(Message).where(
            and_(Message.recruiter_id == recruiter_id, Message.user_id == current_user.id)
        ).order_by(Message.created_at.desc())
    )
    messages = res.scalars().all()
    return messages


@router.post("/{recruiter_id}/message")
async def send_message_to_recruiter(
    recruiter_id: int,
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Send or record a personalized outreach message to a recruiter.
    Enforces 'DO NOT CONTACT' and deduplication checks.
    """
    rec_res = await db.execute(
        select(Recruiter).where(and_(Recruiter.id == recruiter_id, Recruiter.user_id == current_user.id))
    )
    recruiter = rec_res.scalar_one_or_none()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")

    # Safety check: DO NOT CONTACT
    if recruiter.status == RecruiterStatusEnum.DO_NOT_CONTACT:
        raise HTTPException(
            status_code=400,
            detail="Safety Violation: This recruiter is marked as 'DO NOT CONTACT'. Outgoing messages are strictly blocked."
        )

    # Check cooldown and duplicate message
    is_msg_dup, dup_reason = await recruiter_deduplicator.check_message_duplicate(
        db, current_user.id, recruiter.id, payload.content
    )
    if is_msg_dup:
        raise HTTPException(status_code=400, detail=f"Duplicate outreach blocked: {dup_reason}")

    msg = Message(
        recruiter_id=recruiter.id,
        user_id=current_user.id,
        message_type=payload.message_type,
        status="sent",
        subject=payload.subject,
        content=payload.content,
        sent_date=datetime.utcnow(),
    )
    db.add(msg)

    # Update recruiter record
    if not recruiter.first_contact_date:
        recruiter.first_contact_date = datetime.utcnow()
    recruiter.last_contact_date = datetime.utcnow()
    recruiter.total_contacts += 1
    recruiter.status = RecruiterStatusEnum.CONTACTED
    recruiter.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(msg)

    return {
        "message": f"Message successfully recorded/sent to {recruiter.name} at {recruiter.company}",
        "message_id": msg.id,
        "sent_date": msg.sent_date.isoformat(),
    }
