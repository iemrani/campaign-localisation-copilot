from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Campaign Localisation Copilot"
    debug: bool = True

    # LLM
    llm_provider: str = "claude"           # swap to "azure_openai" later
    anthropic_api_key: str = ""
    claude_model: str = "claude-3-5-haiku-20241022"

    # Database
    database_url: str = "sqlite:///./copilot.sqlite3"

    class Config:
        env_file = ".env"

settings = Settings()