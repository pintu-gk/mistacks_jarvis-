from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "jarvis-backend"
    gemini_configured: bool


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=8000)
    history: list[dict[str, str]] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    model: str


class ParseCommandRequest(BaseModel):
    command: str = Field(..., min_length=1, max_length=2000)


class ParsedCommand(BaseModel):
    action: str | None = None
    target: str | None = None
    app: str | None = None
    query: str | None = None
    extra: dict[str, str] = Field(default_factory=dict)


class ParseCommandResponse(BaseModel):
    parsed: ParsedCommand | None
    raw: str
    executed: bool = False
    message: str | None = None


class ExecuteActionRequest(BaseModel):
    action: str
    target: str | None = None
    query: str | None = None


class ExecuteActionResponse(BaseModel):
    success: bool
    message: str


class SpeakRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)


class SpeakResponse(BaseModel):
    success: bool
    message: str
