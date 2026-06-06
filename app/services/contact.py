import httpx
from app.core.config import get_settings


async def send_to_webhook(name: str, email: str, message: str) -> bool:
    settings = get_settings()
    if not settings.contact_webhook_url:
        return True

    payload = {
        "content": None,
        "embeds": [
            {
                "title": "New Contact Form Submission",
                "color": 3447003,
                "fields": [
                    {"name": "Name", "value": name, "inline": True},
                    {"name": "Email", "value": email, "inline": True},
                    {"name": "Message", "value": message, "inline": False},
                ],
            }
        ],
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                settings.contact_webhook_url,
                json=payload,
                timeout=10.0,
            )
            return response.status_code < 300
    except Exception:
        return False
