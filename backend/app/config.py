from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    mongodb_uri: str
    auth0_domain: str
    auth0_api_audience: str
    gemini_api_key: str

    class Config:
        env_file = ".env"
        case_sensitive = False