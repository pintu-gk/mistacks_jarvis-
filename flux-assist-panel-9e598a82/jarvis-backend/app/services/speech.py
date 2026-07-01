import threading

_engine = None
_lock = threading.Lock()


def _get_engine():
    global _engine
    with _lock:
        if _engine is None:
            import pyttsx3

            _engine = pyttsx3.init()
            _engine.setProperty("rate", 175)
        return _engine


def speak(text: str) -> None:
    engine = _get_engine()
    engine.say(text)
    engine.runAndWait()
