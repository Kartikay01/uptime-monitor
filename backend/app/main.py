import logging
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import models, schemas
from .database import Base, engine, get_db
from .scheduler import create_scheduler, run_checks

logging.basicConfig(level=logging.INFO)

scheduler = create_scheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    scheduler.start()
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(title="Uptime Monitor API", lifespan=lifespan)

# Wide open CORS for local dev / grading convenience. Tighten before any
# real deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/urls", response_model=schemas.URLOut, status_code=201)
def add_url(payload: schemas.URLCreate, db: Session = Depends(get_db)):
    """Register a new URL for monitoring."""
    url = models.URL(url=str(payload.url), label=payload.label)
    db.add(url)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="URL is already being monitored")
    db.refresh(url)
    return url


@app.get("/urls", response_model=List[schemas.URLWithLatestCheck])
def list_urls(db: Session = Depends(get_db)):
    """List all monitored URLs along with their most recent check result."""
    urls = db.query(models.URL).order_by(models.URL.created_at.desc()).all()
    result = []
    for url in urls:
        latest_check = url.checks[0] if url.checks else None
        item = schemas.URLWithLatestCheck.model_validate(url)
        item.latest_check = schemas.CheckOut.model_validate(latest_check) if latest_check else None
        result.append(item)
    return result


@app.get("/urls/{url_id}/checks", response_model=List[schemas.CheckOut])
def get_url_checks(url_id: int, db: Session = Depends(get_db)):
    """Return the full check history for a single URL, most recent first."""
    url = db.query(models.URL).filter(models.URL.id == url_id).first()
    if not url:
        raise HTTPException(status_code=404, detail="URL not found")
    return url.checks


@app.delete("/urls/{url_id}", status_code=204)
def delete_url(url_id: int, db: Session = Depends(get_db)):
    """Stop monitoring a URL and delete its check history."""
    url = db.query(models.URL).filter(models.URL.id == url_id).first()
    if not url:
        raise HTTPException(status_code=404, detail="URL not found")
    db.delete(url)
    db.commit()
    return None


@app.post("/urls/check-now", status_code=202)
def trigger_check_now():
    """Manually trigger an immediate check cycle (handy for demos/testing
    instead of waiting up to a minute for the next scheduled tick)."""
    scheduler.add_job(run_checks, id="manual_check", replace_existing=True)
    return {"detail": "Check cycle triggered"}


@app.get("/health")
def health():
    return {"status": "ok"}