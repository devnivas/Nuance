# Nuance — AI-Powered News Sentiment Analysis

> Decode the emotional tone of any news article in under a second.

![Nuance Dashboard](https://img.shields.io/badge/status-live-brightgreen) ![Python](https://img.shields.io/badge/Python-3.12-blue) ![React](https://img.shields.io/badge/React-19-61DAFB) ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688) ![Docker](https://img.shields.io/badge/Docker-ready-2496ED)

---

## What is Nuance?

Nuance is a full-stack web application that analyzes the sentiment of any publicly accessible news article. Paste a URL, and within milliseconds Nuance scrapes the article, processes its language, and returns a polarity score, subjectivity rating, top keywords, and a lead sentence summary — all visualized through a high-end dark mode dashboard.

---

## Live Demo

> 🌐 [nuance.up.railway.app](https://nuance.up.railway.app) *(replace with your Railway URL)*

---

## Features

- **Sentiment Scoring** — Polarity score from -1.0 (very negative) to +1.0 (very positive) visualized as an animated gauge ring
- **Subjectivity Rating** — Measures how opinion-based vs fact-based the article is (0% objective → 100% subjective)
- **Top Keywords** — Extracts the 6 most meaningful words from the article body
- **Lead Sentence** — Surfaces the first meaningful sentence as a quick article summary
- **Skeleton Loader** — High-tech loading state while the backend processes the request
- **Staggered Animations** — Cards fade in sequentially using Framer Motion
- **Glassmorphism UI** — Dark mode dashboard with animated mesh gradients and neon input glow
- **Cloud Ready** — Fully Dockerized for deployment to Railway, AWS App Runner, or Azure Container Apps

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite 6 | Build tool and dev server |
| Tailwind CSS 3 | Utility-first styling |
| Framer Motion 11 | Fluid animations and micro-interactions |
| Lucide React | Minimalist icon set |

### Backend
| Technology | Purpose |
|---|---|
| Python 3.12 | Runtime |
| FastAPI | REST API framework |
| Uvicorn | ASGI server |
| TextBlob | NLP sentiment analysis |
| BeautifulSoup4 | HTML scraping and parsing |
| httpx | Async HTTP client |
| Pydantic v2 | Request/response validation |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker | Containerization |
| Railway | Cloud deployment |
| GitHub | Version control |

---

## Project Structure

```
nuance/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SentimentGauge.tsx     # Animated SVG ring gauge
│   │   │   └── SkeletonLoader.tsx     # Loading state UI
│   │   ├── Dashboard.tsx              # Main application view
│   │   ├── App.tsx                    # Root component
│   │   ├── main.tsx                   # Entry point
│   │   └── index.css                  # Global styles + Tailwind
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
├── backend/
│   ├── main.py                        # FastAPI app + scraping + NLP
│   ├── schemas.py                     # Pydantic request/response models
│   └── requirements.txt
├── Dockerfile                         # Multi-stage production build
├── docker-compose.yml
├── .dockerignore
└── .gitignore
```

---

## Getting Started

### Prerequisites

- Node.js v22+
- Python 3.12+
- Docker Desktop *(optional, for containerized run)*

### Local Development

**1. Clone the repository**
```bash
git clone https://github.com/devnivas/Internship_project.git
cd Internship_project/new-sentiment-app
```

**2. Start the backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# or
source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
python -m textblob.download_corpora
uvicorn main:app --reload
```
Backend runs at `http://localhost:8000`

**3. Start the frontend** *(new terminal)*
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`

---

### Run with Docker

```bash
# Build and run the full stack as a single container
docker build -t nuance .
docker run -p 8000:8000 nuance
```
Open `http://localhost:8000` in your browser.

---

## API Reference

### `POST /analyze`

Analyzes the sentiment of a news article at the given URL.

**Request body:**
```json
{
  "url": "https://www.bbc.com/news/articles/example"
}
```

**Response:**
```json
{
  "url": "https://www.bbc.com/news/articles/example",
  "title": "Article Title Here",
  "score": -0.04,
  "label": "Neutral",
  "subjectivity": 0.30,
  "word_count": 795,
  "top_keywords": ["iran", "prices", "strait", "energy", "price", "would"],
  "summary": "First meaningful sentence of the article.",
  "processing_time_ms": 1024
}
```

**Sentiment labels:**

| Score Range | Label |
|---|---|
| > +0.10 | Positive |
| -0.10 to +0.10 | Neutral |
| < -0.10 | Negative |

---

### `GET /health`

Returns API health status.

```json
{ "status": "ok", "version": "1.0.0" }
```

---

## Deployment

### Railway *(recommended)*

1. Push the repository to GitHub
2. Go to [railway.app](https://railway.app) and sign in with GitHub
3. Click **New Project → Deploy from GitHub repo**
4. Select this repository
5. Railway auto-detects the `Dockerfile` and builds the container
6. Click **Generate Domain** to get your public URL

### AWS App Runner

```bash
aws ecr create-repository --repository-name nuance
docker build -t nuance .
docker tag nuance:latest <ECR_URI>:latest
docker push <ECR_URI>:latest
# Create App Runner service pointing at the ECR image
```

### Azure Container Apps

```bash
az acr build --registry <ACR_NAME> --image nuance:latest .
az containerapp create --name nuance \
  --resource-group myRG \
  --image <ACR_NAME>.azurecr.io/nuance:latest \
  --target-port 8000 --ingress external
```

---

## Known Limitations

- **Paywalled articles** — Sites requiring login (The Hindu, NYT, Bloomberg) return limited or inaccurate results since the scraper only sees the login page
- **JavaScript-rendered pages** — Sites that load content via JavaScript after page load may not return full article text
- **Obituary paradox** — Tribute articles score falsely positive because eulogy language (legendary, beloved, iconic) overwhelms words like "died"
- **Sentiment averaging** — TextBlob averages polarity across all words, which dilutes strong sentiment in long articles

---

## Roadmap

- [ ] Upgrade NLP engine from TextBlob to VADER for better emotional nuance
- [ ] Add HuggingFace transformer model for context-aware analysis
- [ ] Support batch URL analysis (multiple articles at once)
- [ ] Add historical sentiment tracking and charts
- [ ] Add source credibility scoring
- [ ] Browser extension version

---

## Screenshots

| Dashboard | Results |
|---|---|
| *Input screen with animated gradient background* | *Sentiment gauge, stats, keywords, and summary* |

---

## License

MIT License — feel free to use, modify, and distribute.

---

## Author

**Shrinivas** — built as part of an internship project exploring full-stack development and NLP.

- GitHub: [@devnivas](https://github.com/devnivas)

---

*Nuance — because every story has a tone.*
