from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, HttpUrl


class URLCreate(BaseModel):
    url: HttpUrl
    label: Optional[str] = None


class CheckOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status_code: Optional[int]
    response_time_ms: Optional[float]
    is_up: bool
    checked_at: datetime


class URLOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    label: Optional[str]
    created_at: datetime


class URLWithLatestCheck(URLOut):
    latest_check: Optional[CheckOut] = None