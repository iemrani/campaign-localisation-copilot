from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Campaign Localisation Copilot"
    debug: bool = True

    # LLM
    llm_provider: str = "claude"           # swap to "azure_openai" later
    anthropic_api_key: str = ""
    claude_model: str = "claude-sonnet-5"

    # Database
    database_url: str = "sqlite:///./copilot.sqlite3"

    # Public demo. static_dir is the built frontend; when it is missing the
    # app still serves the API alone, which is what local dev does.
    static_dir: str = "static"
    rate_limit_per_ip_per_hour: int = 20
    rate_limit_global_per_day: int = 300


    class Config:
        env_file = ".env"

settings = Settings()