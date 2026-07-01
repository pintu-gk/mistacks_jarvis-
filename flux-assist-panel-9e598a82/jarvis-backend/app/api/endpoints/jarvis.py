from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app.models.schemas import (
    ChatRequest,
    ChatResponse,
    ExecuteActionRequest,
    ExecuteActionResponse,
    HealthResponse,
    ParseCommandRequest,
    ParseCommandResponse,
    ParsedCommand,
    SpeakRequest,
    SpeakResponse,
)
from app.services.actions import execute_parsed, match_local_command
from app.services.gemini import chat, parse_command
from app.services.speech import speak

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(gemini_configured=bool(settings.gemini_api_key))


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(body: ChatRequest) -> ChatResponse:
    settings = get_settings()
    try:
        reply = await chat(body.message, body.history)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI error: {exc}") from exc
    return ChatResponse(reply=reply, model=settings.gemini_model)


@router.post("/parse-command", response_model=ParseCommandResponse)
async def parse_command_endpoint(body: ParseCommandRequest) -> ParseCommandResponse:
    local = match_local_command(body.command)
    if local:
        local.run()
        return ParseCommandResponse(
            parsed=ParsedCommand(action="open_app", target=local.label.lower()),
            raw=f'{{"action":"open_app","target":"{local.label.lower()}"}}',
            executed=True,
            message=f"Opening {local.label}",
        )

    try:
        parsed_dict, raw = await parse_command(body.command)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI error: {exc}") from exc

    parsed_model: ParsedCommand | None = None
    executed = False
    message: str | None = None

    if parsed_dict:
        parsed_model = ParsedCommand(
            action=parsed_dict.get("action"),
            target=parsed_dict.get("target"),
            app=parsed_dict.get("app"),
            query=parsed_dict.get("query"),
            extra={k: str(v) for k, v in parsed_dict.items() if k not in {"action", "target", "app", "query"}},
        )
        if parsed_model.action and parsed_model.action not in ("chat", "unknown"):
            executed, message = execute_parsed(
                parsed_model.action,
                parsed_model.target or parsed_model.app,
                parsed_model.query,
            )

    return ParseCommandResponse(parsed=parsed_model, raw=raw, executed=executed, message=message)


@router.post("/execute", response_model=ExecuteActionResponse)
async def execute_endpoint(body: ExecuteActionRequest) -> ExecuteActionResponse:
    success, message = execute_parsed(body.action, body.target, body.query)
    return ExecuteActionResponse(success=success, message=message)


@router.post("/speak", response_model=SpeakResponse)
async def speak_endpoint(body: SpeakRequest) -> SpeakResponse:
    try:
        speak(body.text)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"TTS failed: {exc}") from exc
    return SpeakResponse(success=True, message="Spoken")
