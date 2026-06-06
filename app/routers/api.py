from pathlib import Path
from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse

from app.models.schemas import ContactForm
from app.services.contact import send_to_webhook
from app.services.spotify import get_now_playing

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


@router.post("/contact", response_class=HTMLResponse)
async def contact(request: Request, form: ContactForm):
    success = await send_to_webhook(form.name, form.email, form.message)
    if success:
        return """
        <div class="text-center p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <svg class="w-12 h-12 mx-auto mb-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <h3 class="text-lg font-semibold text-emerald-400">Message Sent!</h3>
            <p class="text-sm text-gray-400 mt-1">Thanks for reaching out. I'll get back to you soon.</p>
        </div>
        """
    return """
    <div class="text-center p-6 rounded-xl bg-red-500/10 border border-red-500/20">
        <h3 class="text-lg font-semibold text-red-400">Something went wrong</h3>
        <p class="text-sm text-gray-400 mt-1">Please try again or email me directly.</p>
    </div>
    """


@router.get("/spotify", response_class=HTMLResponse)
async def spotify_now_playing(request: Request):
    track = await get_now_playing()
    return templates.TemplateResponse(
        request,
        "components/spotify_widget.html",
        context={"track": track},
    )
