import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, Send, Mic, MicOff, Trash2 } from "lucide-react";
import { PageShell, PageHeader } from "@/components/jarvis/PageShell";
import { GlassCard } from "@/components/jarvis/ui";
import { sendChatMessage } from "../api";

export const Route = createFileRoute("/chat")({ component: Page });

type Msg = { role: "user" | "ai"; text: string };

function Page() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: "Hey Abhi! I'm Jarvis. How can I help you today?" },
  ]);
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!text.trim() || loading) return;

    const userMsg = text;
    setText("");
    setMsgs(prev => [...prev, { role: "user", text: userMsg }]);
    setMsgs(prev => [...prev, { role: "ai", text: "..." }]);
    setLoading(true);

    try {
      const reply = await sendChatMessage(userMsg);
      setMsgs(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "ai", text: reply };
        return updated;
      });
    } catch (error: any) {
      setMsgs(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { 
          role: "ai", 
          text: `⚠️ Error: ${error.message || "Something went wrong"}` 
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setMsgs([{ role: "ai", text: "Chat cleared. How can I assist you?" }]);
  };

  const toggleMic = () => {
    setIsRecording(!isRecording);
  };

  return (
    <PageShell>
      <PageHeader
        title="AI Chat"
        subtitle="Conversational interface."
        icon={<MessageCircle className="h-5 w-5" />}
      />
      <GlassCard className="flex h-[calc(100vh-260px)] flex-col !p-0">
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
          <span className="text-xs font-medium text-slate-400">Conversation</span>
          <button
            onClick={clearHistory}
            className="flex items-center gap-1 rounded-lg border border-red-500/30 px-3 py-1 text-xs text-red-400 transition hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        </div>

        <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-6">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-cyan-300 text-black"
                    : "border border-white/10 bg-white/5"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-white/5 p-4">
          <button
            onClick={toggleMic}
            className={`grid h-10 w-10 place-items-center rounded-full transition ${
              isRecording
                ? "bg-red-500/20 text-red-400"
                : "bg-white/5 text-cyan-300 hover:bg-white/10"
            }`}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={isRecording ? "Listening..." : "Message Jarvis..."}
            className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-cyan-300/50 focus:outline-none"
            disabled={loading}
          />
          <button
            onClick={send}
            disabled={loading || !text.trim()}
            className={`grid h-10 w-10 place-items-center rounded-full ${
              loading || !text.trim()
                ? "bg-white/10 text-gray-500 cursor-not-allowed"
                : "bg-cyan-300 text-black hover:bg-cyan-200"
            }`}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </GlassCard>
    </PageShell>
  );
}