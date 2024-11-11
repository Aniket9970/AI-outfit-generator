from pydantic import BaseSettings

class Settings(BaseSettings):
    ENV: str = "development"
    DEBUG: bool = True
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DATABASE_URL: str = "sqlite:///./wardrobe.db"
    
    class Config:
        env_file = ".env"

settings = Settings() 