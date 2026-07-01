const API_BASE = "http://localhost:8000";

export async function sendChatMessage(message: string, history: any[] = []) {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to get response");
  }
  const data = await response.json();
  return data.reply;
}