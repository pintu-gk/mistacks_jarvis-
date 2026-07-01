import subprocess
import webbrowser
from dataclasses import dataclass
from typing import Callable

try:
    import pyautogui
except ImportError:
    pyautogui = None  # type: ignore[assignment]


@dataclass
class AppAction:
    label: str
    keywords: tuple[str, ...]
    run: Callable[[], None]


def _open_url(url: str) -> None:
    webbrowser.open(url, new=2)


def _open_app(name: str) -> None:
    subprocess.Popen(["start", "", name], shell=True)  # noqa: S603,S607


APP_REGISTRY: list[AppAction] = [
    AppAction("YouTube", ("youtube",), lambda: _open_url("https://youtube.com")),
    AppAction("Google", ("google",), lambda: _open_url("https://google.com")),
    AppAction("Gmail", ("gmail", "mail", "email"), lambda: _open_url("https://mail.google.com")),
    AppAction("WhatsApp", ("whatsapp",), lambda: _open_url("https://web.whatsapp.com")),
    AppAction("Maps", ("map", "maps"), lambda: _open_url("https://maps.google.com")),
    AppAction("GitHub", ("github",), lambda: _open_url("https://github.com")),
    AppAction("Notepad", ("notepad", "notes"), lambda: _open_app("notepad")),
    AppAction("Calculator", ("calculator", "calc"), lambda: _open_app("calc")),
]


def match_local_command(command: str) -> AppAction | None:
    lower = command.lower()
    for action in APP_REGISTRY:
        if any(kw in lower for kw in action.keywords):
            return action
    return None


def execute_parsed(action: str, target: str | None = None, query: str | None = None) -> tuple[bool, str]:
    action_lower = (action or "").lower()
    target_lower = (target or "").lower()

    if action_lower == "open_app" and target_lower:
        for app in APP_REGISTRY:
            if any(kw in target_lower for kw in app.keywords):
                app.run()
                return True, f"Opening {app.label}"

    if action_lower == "search" and query:
        engine = target_lower or "google"
        if "bing" in engine:
            url = f"https://www.bing.com/search?q={query.replace(' ', '+')}"
        else:
            url = f"https://www.google.com/search?q={query.replace(' ', '+')}"
        _open_url(url)
        return True, f"Searching for: {query}"

    if action_lower in ("screenshot", "capture_screen"):
        if pyautogui is None:
            return False, "pyautogui is not available"
        path = pyautogui.screenshot()
        save_to = f"jarvis_screenshot_{path.size[0]}x{path.size[1]}.png"
        path.save(save_to)
        return True, f"Screenshot saved to {save_to}"

    local = match_local_command(target or query or "")
    if local:
        local.run()
        return True, f"Opening {local.label}"

    return False, "No matching action found"
