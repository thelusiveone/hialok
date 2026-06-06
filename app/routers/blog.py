from pathlib import Path
from fastapi import APIRouter, Request, HTTPException
from fastapi.templating import Jinja2Templates

from app.services.blog import get_all_posts, get_post

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


@router.get("/")
async def blog_list(request: Request):
    posts = get_all_posts()
    return templates.TemplateResponse(request, "blog/list.html", context={"posts": posts})


@router.get("/{slug}")
async def blog_post(request: Request, slug: str):
    post = get_post(slug)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return templates.TemplateResponse(request, "blog/post.html", context={"post": post})
