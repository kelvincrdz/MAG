from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "MAG Backend"
    secret_key: str = "change-this-secret"
    access_token_expire_minutes: int = 60 * 24  # 24h
    cors_origins: list[str] = ["http://localhost:3000"]

    storage_dir: str = "backend/storage"
    audio_dir_name: str = "audio"

    class Config:
        env_file = ".env"

settings = Settings()
