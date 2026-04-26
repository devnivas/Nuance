import time
import re
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from textblob import TextBlob
import httpx
from bs4 import BeautifulSoup
from collections import Counter

from schemas import AnalyzeRequest, SentimentResult

app = FastAPI(title="News Sentiment API", version="1.0.0")

# ── CORS ─────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten to your Railway domain in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Constants ─────────────────────────────────────────────────
STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "is", "it", "its", "this", "that", "was", "are", "be", "with",
    "as", "by", "from", "said", "has", "have", "he", "she", "they", "we",
    "who", "what", "when", "where", "how", "their", "his", "her", "had",
    "been", "were", "will", "would", "could", "should", "may", "might",
    "also", "about", "after", "before", "between", "into", "more", "than",
    "then", "them", "these", "those", "your", "our", "can", "not", "which",
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

# ── Helpers ───────────────────────────────────────────────────
def extract_keywords(text: str, top_n: int = 6) -> list[str]:
    """Extract most frequent meaningful words from text."""
    words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
    filtered = [w for w in words if w not in STOPWORDS]
    return [w for w, _ in Counter(filtered).most_common(top_n)]


def score_to_label(score: float) -> str:
    """Convert polarity score to human-readable label."""
    if score > 0.1:
        return "Positive"
    elif score < -0.1:
        return "Negative"
    return "Neutral"


def extract_body_text(soup: BeautifulSoup) -> str:
    """
    Intelligently extract main article body text.
    Tries multiple common article container selectors before
    falling back to all <p> tags.
    """
    # Try semantic article containers first
    selectors = [
        "article",
        "[class*='article-body']",
        "[class*='story-body']",
        "[class*='post-content']",
        "[class*='entry-content']",
        "[class*='article-content']",
        "main",
    ]
    for selector in selectors:
        container = soup.select_one(selector)
        if container:
            paragraphs = container.find_all("p")
            text = " ".join(p.get_text(strip=True) for p in paragraphs)
            if len(text) > 200:
                return text

    # Fallback — grab all paragraphs from the page
    paragraphs = soup.find_all("p")
    return " ".join(p.get_text(strip=True) for p in paragraphs[:60])


def extract_title(soup: BeautifulSoup) -> str:
    """Extract the best available title from the page."""
    # Try Open Graph title first (most accurate for articles)
    og_title = soup.find("meta", property="og:title")
    if og_title and og_title.get("content"):
        return og_title["content"].strip()[:160]

    # Try standard title tag
    title_tag = soup.find("title")
    if title_tag:
        return title_tag.get_text(strip=True)[:160]

    # Fallback to first h1
    h1 = soup.find("h1")
    if h1:
        return h1.get_text(strip=True)[:160]

    return "Unknown"


def extract_summary(blob: TextBlob, fallback: str) -> str:
    """Get the first meaningful sentence as summary."""
    for sentence in blob.sentences:
        text = str(sentence).strip()
        # Skip very short sentences (likely navigation/UI text)
        if len(text.split()) >= 8:
            return text
    return fallback[:300]


# ── Routes ────────────────────────────────────────────────────
@app.post("/analyze", response_model=SentimentResult)
async def analyze(req: AnalyzeRequest):
    start = time.time()

    # Fetch the article page
    try:
        async with httpx.AsyncClient(
            timeout=15,
            follow_redirects=True,
            headers=HEADERS
        ) as client:
            response = await client.get(str(req.url))
            response.raise_for_status()
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=408,
            detail="Request timed out. The website took too long to respond."
        )
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Website returned error {e.response.status_code}. "
                   f"The URL may be invalid or the site may be down."
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Could not fetch URL: {str(e)}"
        )

    # Parse HTML
    soup = BeautifulSoup(response.text, "html.parser")

    # Remove noise elements (scripts, styles, nav, footer, ads)
    for tag in soup(["script", "style", "nav", "footer", "header",
                     "aside", "form", "button", "noscript"]):
        tag.decompose()

    # Extract content
    title = extract_title(soup)
    body = extract_body_text(soup)

    # Validate we have enough content
    if len(body.split()) < 30:
        raise HTTPException(
            status_code=422,
            detail=(
                "Not enough readable text found. "
                "The page may be paywalled, JavaScript-rendered, "
                "or require a login."
            )
        )

    # Run sentiment analysis
    blob = TextBlob(body)
    score = round(blob.sentiment.polarity, 4)
    subjectivity = round(blob.sentiment.subjectivity, 4)
    label = score_to_label(score)
    summary = extract_summary(blob, body)
    keywords = extract_keywords(body)
    elapsed_ms = int((time.time() - start) * 1000)

    return SentimentResult(
        url=str(req.url),
        title=title,
        score=score,
        label=label,
        subjectivity=subjectivity,
        word_count=len(body.split()),
        top_keywords=keywords,
        summary=summary,
        processing_time_ms=elapsed_ms,
    )


@app.get("/health")
async def health():
    """Health check endpoint for Docker and Railway."""
    return {"status": "ok", "version": "1.0.0"}


# ── Serve React Frontend (Production) ─────────────────────────
# In development, Vite serves the frontend on its own port.
# In production (Docker/Railway), FastAPI serves the built React files.
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")

if os.path.exists(static_dir):
    # Serve static assets (JS, CSS, images)
    assets_dir = os.path.join(static_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """
        Catch-all route — serves index.html for all non-API routes.
        This enables React Router to handle client-side navigation.
        """
        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        raise HTTPException(status_code=404, detail="Frontend not built yet.")