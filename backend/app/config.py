from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    mongodb_uri: str
    mongodb_database: str = "expindatabase"
    auth0_domain: str
    auth0_api_audience: str
    auth0_client_id: str
    auth0_client_secret: str
    gemini_api_key: str

    class Config:
        env_file = ".env"
        case_sensitive = False