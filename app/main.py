from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.core.config import get_settings
from app.core.middleware import SubdomainMiddleware
from app.routers import pages, blog, api

BASE_DIR = Path(__file__).resolve().parent.parent

app = FastAPI(title="Alok Shukla - Portfolio", docs_url=None, redoc_url=None)

app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")

app.add_middleware(SubdomainMiddleware)

app.include_router(pages.router)
app.include_router(blog.router, prefix="/blog")
app.include_router(api.router, prefix="/api")

templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

settings = get_settings()
for t in [templates, pages.templates, blog.templates, api.templates]:
    t.env.globals["spotify_poll_interval"] = settings.spotify_poll_interval
    t.env.globals["github_url"] = settings.github_url
    t.env.globals["linkedin_url"] = settings.linkedin_url
    t.env.globals["twitter_url"] = settings.twitter_url
    t.env.globals["contact_email"] = settings.contact_email
