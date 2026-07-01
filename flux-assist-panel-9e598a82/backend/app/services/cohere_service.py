import os
import requests
from dotenv import load_dotenv

load_dotenv()

class CohereService:
    def __init__(self):
        self.api_key = os.getenv("COHERE_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        self.model = "cohere/north-mini-code-1-0"  # or any model you want

    def get_response(self, user_message: str, chat_history: list = None) -> str:
        try:
            messages = []
            messages.append({
                "role": "system",
                "content": "You are JARVIS, a helpful and friendly AI assistant."
            })
            
            if chat_history:
                for msg in chat_history:
                    messages.append({
                        "role": msg["role"],
                        "content": msg["content"]
                    })
            
            messages.append({
                "role": "user",
                "content": user_message
            })

            response = requests.post(
                self.base_url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "JARVIS AI",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model,
                    "messages": messages
                }
            )

            if response.status_code != 200:
                error_data = response.json()
                error_msg = error_data.get("error", {}).get("message", "Unknown error")
                return f"⚠️ API Error: {error_msg}"

            data = response.json()
            return data["choices"][0]["message"]["content"]

        except Exception as e:
            return f"I'm sorry, something went wrong: {str(e)}"