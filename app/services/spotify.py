import base64
import httpx
from app.core.config import get_settings
from app.models.schemas import SpotifyTrack

TOKEN_URL = "https://accounts.spotify.com/api/token"
NOW_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing"
RECENTLY_PLAYED_URL = "https://api.spotify.com/v1/me/player/recently-played"


async def _get_access_token() -> str | None:
    settings = get_settings()
    if not all([settings.spotify_client_id, settings.spotify_client_secret, settings.spotify_refresh_token]):
        return None

    credentials = base64.b64encode(
        f"{settings.spotify_client_id}:{settings.spotify_client_secret}".encode()
    ).decode()

    async with httpx.AsyncClient() as client:
        response = await client.post(
            TOKEN_URL,
            headers={"Authorization": f"Basic {credentials}"},
            data={
                "grant_type": "refresh_token",
                "refresh_token": settings.spotify_refresh_token,
            },
            timeout=10.0,
        )
        if response.status_code == 200:
            return response.json().get("access_token")
    return None


async def get_now_playing() -> SpotifyTrack | None:
    token = await _get_access_token()
    if not token:
        return None

    headers = {"Authorization": f"Bearer {token}"}

    async with httpx.AsyncClient() as client:
        response = await client.get(NOW_PLAYING_URL, headers=headers, timeout=10.0)

        if response.status_code == 200 and response.text:
            data = response.json()
            if data.get("item"):
                item = data["item"]
                return SpotifyTrack(
                    track_name=item["name"],
                    artist=", ".join(a["name"] for a in item["artists"]),
                    album_art=item["album"]["images"][0]["url"] if item["album"]["images"] else "",
                    spotify_url=item["external_urls"].get("spotify", ""),
                    is_playing=data.get("is_playing", False),
                )

        response = await client.get(
            RECENTLY_PLAYED_URL,
            headers=headers,
            params={"limit": 1},
            timeout=10.0,
        )
        if response.status_code == 200:
            data = response.json()
            items = data.get("items", [])
            if items:
                item = items[0]["track"]
                return SpotifyTrack(
                    track_name=item["name"],
                    artist=", ".join(a["name"] for a in item["artists"]),
                    album_art=item["album"]["images"][0]["url"] if item["album"]["images"] else "",
                    spotify_url=item["external_urls"].get("spotify", ""),
                    is_playing=False,
                )

    return None
