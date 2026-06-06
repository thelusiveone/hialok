from pydantic import BaseModel, EmailStr
from datetime import datetime


class ContactForm(BaseModel):
    name: str
    email: str
    message: str


class BlogPostMeta(BaseModel):
    title: str
    slug: str
    date: datetime
    tags: list[str] = []
    description: str = ""
    cover: str = ""
    reading_time: str = ""


class SpotifyTrack(BaseModel):
    track_name: str
    artist: str
    album_art: str
    spotify_url: str
    is_playing: bool
