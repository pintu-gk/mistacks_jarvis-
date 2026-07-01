import { createServerFn } from "@tanstack/react-start";

export const parseCommand = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const d = data as { command?: string };
    if (!d?.command || typeof d.command !== "string") throw new Error("command required");
    return { command: d.command };
  })
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "raw-fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              'You are a command parser for an Android assistant. Convert the user\'s natural language command into a JSON object with keys: "action" and "target". For example: "open youtube" -> {"action":"open_app","target":"youtube"}. Only respond with the JSON, no markdown, no prose.',
          },
          { role: "user", content: data.command },
        ],
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`AI error ${res.status}: ${text.slice(0, 200)}`);
    }
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content?.trim() ?? "{}";
    const cleaned = content.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    try {
      return { parsed: JSON.parse(cleaned), raw: content };
    } catch {
      return { parsed: null, raw: content };
    }
  });
