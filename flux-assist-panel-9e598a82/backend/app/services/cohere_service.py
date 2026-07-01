import os
import cohere
from dotenv import load_dotenv

load_dotenv()

class CohereService:
    def __init__(self):
        self.client = cohere.ClientV2(api_key=os.getenv("COHERE_API_KEY"))
        self.model = "north-mini-code-1-0"

    def get_response(self, user_message: str, chat_history: list = None) -> str:
        try:
            messages = []
            # System prompt (customise as you like)
            messages.append({
                "role": "system",
                "content": "You are JARVIS, a helpful and friendly AI assistant. You give clear, concise, and accurate answers."
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

            response = self.client.chat(
                model=self.model,
                messages=messages
            )
            return response.message.content[0].text
        except Exception as e:
            return f"I'm sorry, something went wrong: {str(e)}"