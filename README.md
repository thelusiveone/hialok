# hialok.com

Personal portfolio website built with **FastAPI**, **Jinja2**, **Tailwind CSS**, and **HTMX**.

## Features

- **Single-page portfolio** with smooth scroll sections (Hero, About, Skills, Experience, Projects, Contact)
- **Dark / Light mode** with system preference detection and localStorage persistence
- **Blog engine** powered by Markdown files with syntax highlighting (`blog.hialok.com`)
- **Spotify "Now Playing"** widget with auto-refresh via HTMX polling
- **Contact form** with webhook integration (Discord/Slack)
- **Mobile-responsive** design with hamburger menu
- **Vercel-ready** deployment configuration

## Quick Start

### Prerequisites

- Python 3.11+
- pip

### Install & Run

```bash
# Install dependencies
pip install -r requirements.txt

# Run the dev server
uvicorn app.main:app --reload --port 8000
```

Visit [http://localhost:8000](http://localhost:8000) for the main site and [http://localhost:8000/blog](http://localhost:8000/blog) for the blog.

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `CONTACT_WEBHOOK_URL` | Discord/Slack webhook URL for contact form submissions |
| `SPOTIFY_CLIENT_ID` | Spotify app client ID |
| `SPOTIFY_CLIENT_SECRET` | Spotify app client secret |
| `SPOTIFY_REFRESH_TOKEN` | Long-lived Spotify refresh token |

## Customizing Your Data

All portfolio content lives in **`data/portfolio.yaml`**. Edit this single file to update:

- Name, title, tagline
- About section text and stats
- Skills (languages, frameworks, tools)
- Work experience timeline
- Project showcase

## Writing Blog Posts

Create a new `.md` file in `content/blog/` with YAML frontmatter:

```markdown
---
title: "Your Post Title"
date: 2026-06-01
tags: [python, tutorial]
description: "A short description for the listing page."
---

Your markdown content here...
```

The blog engine automatically picks up new posts, parses frontmatter, renders syntax-highlighted code blocks, and calculates reading time.

## Spotify Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click **Create App**
3. Set Redirect URI to `http://localhost:8000/callback`
4. Note your **Client ID** and **Client Secret**
5. Open this URL in your browser (replace `YOUR_CLIENT_ID`):

```
https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:8000/callback&scope=user-read-currently-playing%20user-read-recently-played
```

6. After authorizing, you'll be redirected to `http://localhost:8000/callback?code=XXXXXX`
7. Copy the `code` parameter and exchange it for a refresh token:

```bash
curl -X POST "https://accounts.spotify.com/api/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=YOUR_CODE" \
  -d "redirect_uri=http://localhost:8000/callback" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"
```

8. Save the `refresh_token` from the response to your `.env` file

## Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial portfolio website"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel auto-detects the `vercel.json` configuration
4. Add environment variables in Project Settings > Environment Variables
5. Deploy

### 3. Configure Domain (GoDaddy)

In your GoDaddy DNS settings, add these records:

| Type | Name | Value |
|---|---|---|
| A | @ | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |
| CNAME | blog | `cname.vercel-dns.com` |

Then in Vercel Dashboard > Project Settings > Domains, add:
- `hialok.com`
- `www.hialok.com`
- `blog.hialok.com`

Vercel handles SSL certificates automatically.

## Project Structure

```
├── api/index.py              # Vercel serverless entry point
├── app/
│   ├── main.py               # FastAPI application
│   ├── routers/              # Route handlers (pages, blog, api)
│   ├── services/             # Business logic (blog, contact, spotify)
│   ├── models/               # Pydantic schemas
│   └── core/                 # Config and middleware
├── templates/                # Jinja2 HTML templates
│   ├── sections/             # Portfolio sections
│   ├── blog/                 # Blog templates
│   └── components/           # Reusable components
├── static/                   # CSS, JS, images
├── content/blog/             # Markdown blog posts
├── data/portfolio.yaml       # Portfolio content
├── vercel.json               # Vercel deployment config
└── requirements.txt          # Python dependencies
```

## Tech Stack

- **[FastAPI](https://fastapi.tiangolo.com/)** - Async Python web framework
- **[Jinja2](https://jinja.palletsprojects.com/)** - Server-side templating
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[HTMX](https://htmx.org/)** - HTML-driven interactivity
- **[Pygments](https://pygments.org/)** - Syntax highlighting
- **[Vercel](https://vercel.com/)** - Serverless deployment

## License

MIT
