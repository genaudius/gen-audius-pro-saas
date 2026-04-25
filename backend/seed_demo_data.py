"""
Gen Audius Pro — Seed Demo Data
================================
Seeds demo artists and tracks into the database for testing the Explore feed.
Run: python seed_demo_data.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, Base, engine, PublishedTrack, ArtistProfile, TrackLike
from datetime import datetime, timedelta
import uuid
import math

def compute_trending_score(likes, plays, shares, created_at, is_featured=False):
    raw = (likes * 3) + (plays * 1) + (shares * 5)
    age_hours = max(0, (datetime.utcnow() - created_at).total_seconds() / 3600)
    decay = math.exp(-age_hours / 168)
    recency_boost = 1.5 if age_hours < 24 else (1.2 if age_hours < 72 else 1.0)
    featured_boost = 1.8 if is_featured else 1.0
    return round(raw * decay * recency_boost * featured_boost, 4)

def seed():
    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(PublishedTrack).count() > 0:
            print("✅ Demo data already seeded. Skipping.")
            return

        now = datetime.utcnow()

        # ── Artists ──────────────────────────────────────────
        artists_data = [
            {
                "user_id": "artist-001", "username": "Danny García",
                "bio": "Dembow producer from RD. Creating the future of urban music with AI.",
                "genre_tags": "Dembow · Urban · Trap",
                "total_plays": 18420, "total_likes": 2841, "followers": 1800, "verified": True,
            },
            {
                "user_id": "artist-002", "username": "Luna Morales",
                "bio": "R&B & Electronic fusion. Gen Audius Pro user since day 1.",
                "genre_tags": "R&B · Electronic · Pop",
                "total_plays": 12300, "total_likes": 1923, "followers": 980, "verified": True,
            },
            {
                "user_id": "artist-003", "username": "Studio Noir",
                "bio": "Trap & Electronic. Dark vibes, heavy 808s, cinematic pads.",
                "genre_tags": "Trap · Electronic · Dark",
                "total_plays": 24100, "total_likes": 3102, "followers": 2100, "verified": False,
            },
            {
                "user_id": "artist-004", "username": "Rave Collective",
                "bio": "House & Techno collective. We make dance floors move.",
                "genre_tags": "House · Techno · EDM",
                "total_plays": 31000, "total_likes": 4200, "followers": 2700, "verified": False,
            },
            {
                "user_id": "artist-005", "username": "Perreo AI",
                "bio": "El futuro del reggaeton está aquí. Gen AI x Urban Latino.",
                "genre_tags": "Reggaeton · Dembow · Latin",
                "total_plays": 42000, "total_likes": 5100, "followers": 3200, "verified": True,
            },
        ]

        for a_data in artists_data:
            if not db.query(ArtistProfile).filter(ArtistProfile.user_id == a_data["user_id"]).first():
                artist = ArtistProfile(**a_data)
                db.add(artist)
                print(f"✅ Artist: {a_data['username']}")

        # ── Tracks ───────────────────────────────────────────
        tracks_data = [
            {
                "track_id": str(uuid.uuid4()), "user_id": "artist-005", "username": "Perreo AI",
                "title": "Reggaeton Future", "genre": "Reggaeton",
                "image_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
                "description": "El futuro del reggaeton generado con IA. 140 BPM, 808 bass, melodic hook.",
                "tags": "reggaeton,ai,future,perreo",
                "likes": 5100, "plays": 42000, "shares": 380, "is_featured": True,
                "created_at": now - timedelta(hours=2),
            },
            {
                "track_id": str(uuid.uuid4()), "user_id": "artist-004", "username": "Rave Collective",
                "title": "House Infinito", "genre": "House",
                "image_url": "https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?w=400&q=80",
                "description": "Deep house track con sintetizadores analógicos y bajo pulsante.",
                "tags": "house,deep,techno,rave",
                "likes": 4200, "plays": 31000, "shares": 290, "is_featured": True,
                "created_at": now - timedelta(hours=4),
            },
            {
                "track_id": str(uuid.uuid4()), "user_id": "artist-003", "username": "Studio Noir",
                "title": "Trap Millennial", "genre": "Trap",
                "image_url": "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&q=80",
                "description": "808s profundos, hi-hats veloces, melodía de piano melancólico.",
                "tags": "trap,808,dark,millennial",
                "likes": 3102, "plays": 24100, "shares": 180, "is_featured": True,
                "created_at": now - timedelta(hours=1),
            },
            {
                "track_id": str(uuid.uuid4()), "user_id": "artist-001", "username": "Danny García",
                "title": "Noches de Dembow", "genre": "Dembow",
                "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80",
                "description": "Dembow clásico con piano melancólico y bajo de 808. Vibe nocturno.",
                "tags": "dembow,piano,808,nocturno",
                "likes": 2841, "plays": 18420, "shares": 210, "is_featured": True,
                "created_at": now - timedelta(hours=6),
            },
            {
                "track_id": str(uuid.uuid4()), "user_id": "artist-002", "username": "Luna Morales",
                "title": "Luna Electrónica", "genre": "Electronic",
                "image_url": "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&q=80",
                "description": "Electronic con influencias R&B. Sintetizadores suaves y voz procesada con RVC.",
                "tags": "electronic,rnb,synth,rvc",
                "likes": 1923, "plays": 12300, "shares": 145, "is_featured": False,
                "created_at": now - timedelta(hours=10),
            },
            {
                "track_id": str(uuid.uuid4()), "user_id": "artist-005", "username": "Perreo AI",
                "title": "Bachata Neural", "genre": "Bachata",
                "image_url": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80",
                "description": "Bachata generada con IA. Guitarra flamenca + bajo de bachata + voz femenina RVC.",
                "tags": "bachata,neural,guitar,rvc",
                "likes": 1540, "plays": 9800, "shares": 120, "is_featured": False,
                "created_at": now - timedelta(hours=14),
            },
            {
                "track_id": str(uuid.uuid4()), "user_id": "artist-003", "username": "Studio Noir",
                "title": "Salsa IA Remix", "genre": "Salsa",
                "image_url": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
                "description": "Clásico de salsa reinventado con IA. Metales, piano, y beat moderno.",
                "tags": "salsa,remix,ia,cali",
                "likes": 876, "plays": 7200, "shares": 88, "is_featured": False,
                "created_at": now - timedelta(hours=22),
            },
            {
                "track_id": str(uuid.uuid4()), "user_id": "artist-004", "username": "Rave Collective",
                "title": "Cumbia Cósmica", "genre": "Cumbia",
                "image_url": "https://images.unsplash.com/photo-1535916707207-35f997b4ac6b?w=400&q=80",
                "description": "Cumbia fusionada con elementos electrónicos y synths espaciales.",
                "tags": "cumbia,cosmica,electronic,fusion",
                "likes": 730, "plays": 5400, "shares": 62, "is_featured": False,
                "created_at": now - timedelta(hours=50),
            },
        ]

        for t_data in tracks_data:
            if not db.query(PublishedTrack).filter(PublishedTrack.track_id == t_data["track_id"]).first():
                created_at = t_data.pop("created_at")
                track = PublishedTrack(**t_data, created_at=created_at)
                track.trending_score = compute_trending_score(
                    track.likes, track.plays, track.shares, created_at, track.is_featured
                )
                db.add(track)
                print(f"🎵 Track: {t_data['title']} (score: {track.trending_score})")

        db.commit()
        print(f"\n✅ Seeding complete! {len(artists_data)} artists, {len(tracks_data)} tracks added.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()