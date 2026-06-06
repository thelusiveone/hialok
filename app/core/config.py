from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    site_name: str = "Alok Shukla"
    site_url: str = "https://hialok.com"
    site_description: str = "Python Software Developer - Building fast, scalable backends"

    github_url: str = "https://github.com/alokshukla"
    linkedin_url: str = "https://linkedin.com/in/alokshukla"
    twitter_url: str = "https://x.com/alokshukla"
    contact_email: str = "hello@hialok.com"

    contact_webhook_url: str = ""

    spotify_client_id: str = ""
    spotify_client_secret: str = ""
    spotify_refresh_token: str = ""
    spotify_poll_interval: int = 30

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
