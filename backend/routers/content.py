"""
Gen Audius Pro — Public Content Router
=======================================
Public endpoints: /api/blog, /api/legal/*
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import BlogPost, LegalDocument
from deps import get_db

router = APIRouter(tags=["Content"])


@router.get("/api/blog")
async def get_blog_posts(db: Session = Depends(get_db)):
    """Public blog list."""
    return (
        db.query(BlogPost)
        .filter(BlogPost.is_published == True)
        .order_by(BlogPost.created_at.desc())
        .all()
    )


@router.get("/api/legal/all")
async def get_all_legal_docs(db: Session = Depends(get_db)):
    docs = db.query(LegalDocument).filter(LegalDocument.is_active == True).all()
    return {
        doc.slug: {"title": doc.title, "content": doc.content, "version": doc.version}
        for doc in docs
    }


@router.get("/api/legal/{slug}")
async def get_legal_doc(slug: str, db: Session = Depends(get_db)):
    doc = (
        db.query(LegalDocument)
        .filter(LegalDocument.slug == slug, LegalDocument.is_active == True)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        "slug": doc.slug,
        "title": doc.title,
        "content": doc.content,
        "version": doc.version,
        "updated_at": doc.updated_at,
    }
