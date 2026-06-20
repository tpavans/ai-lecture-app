import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Access AI Backend"
    API_V1_STR: str = "/api/v1"
    
    # AI APIs
    GEMINI_API_KEY: str = ""
    
    # Databases
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "access_ai"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Server configuration
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
