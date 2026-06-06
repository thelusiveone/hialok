from pathlib import Path
from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates
import yaml

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

DATA_FILE = BASE_DIR / "data" / "portfolio.yaml"


def _load_portfolio_data() -> dict:
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


@router.get("/")
async def index(request: Request):
    data = _load_portfolio_data()
    return templates.TemplateResponse(request, "index.html", context=data)
