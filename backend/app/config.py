from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "sqlite:///./intent.db"

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    GROQ_VISION_MODEL: str = "meta-llama/llama-4-scout-17b-16e-instruct"

    FIREBASE_SERVICE_ACCOUNT_JSON: str = ""
    FIREBASE_SERVICE_ACCOUNT_PATH: str = ""
    AUTH_BYPASS: bool = False

    ALLOWED_ORIGINS: str = "http://localhost:8081,http://localhost:19006,exp://"

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
