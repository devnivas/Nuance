from pydantic import BaseModel, HttpUrl
from typing import Optional

class AnalyzeRequest(BaseModel):
    url: HttpUrl

class SentimentResult(BaseModel):
    url: str
    title: str
    score: float          # -1.0 (very negative) → +1.0 (very positive)
    label: str            # "Positive" | "Neutral" | "Negative"
    subjectivity: float   # 0.0 → 1.0
    word_count: int
    top_keywords: list[str]
    summary: str
    processing_time_ms: int