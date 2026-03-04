# Backend Service

Dedicated Express backend for AI Movie Insight Builder.

## Run

```bash
cp .env.example .env
npm install
npm run dev
```

Service starts on `http://localhost:4000` by default.

## Endpoints

- `GET /health`
- `POST /api/movie-insights`

### Request

```json
{
  "imdbId": "tt0133093"
}
```

### Required env

- `OMDB_API_KEY`

### Optional env

- `TMDB_API_READ_TOKEN`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
