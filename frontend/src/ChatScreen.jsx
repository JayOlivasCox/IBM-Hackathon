import { useState, useRef, useEffect } from "react";
import "./global.css";

const BACKEND_URL = "http://localhost:8000";

const mockMessages = [
  {
    id: 1,
    role: "assistant",
    content: "Hey! I'm your CS50 study buddy. Ask me anything.",
  },
];

const mockSources = [
  { id: 1, name: "CS50 Week 1 Lecture.pdf", type: "pdf",   size: "2.4 MB" },
  { id: 2, name: "My Notes - Arrays.jpg",   type: "image", size: "840 KB" },
];

const mockAgentData = {
  id: "agent_cs50_v3",
  course: "CS50x",
  version: 3,
  score: 87,
  forks: 12,
  created: "2025-03-10",
  base_agent: "agent_cs50_v2",
  categories: { accuracy: 91, usefulness: 88, verbosity: 74, result: 85 },
};

export default function ChatScreen() {
  const [messages, setMessages]     = useState(mockMessages);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [sources, setSources]       = useState(mockSources);
  const [sidebarTab, setSidebarTab] = useState("sources");
  const [dragging, setDragging]     = useState(false);

  const bottomRef    = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { id: Date.now(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res  = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "assistant", content: data.response }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: "⚠️ Couldn't reach the backend. Is it running on port 8000?",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleFiles = (files) => {
    Array.from(files).forEach((file) => {
      const allowed = ["application/pdf", "image/jpeg", "image/png"];
      if (!allowed.includes(file.type)) return;
      setSources((prev) => [...prev, {
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type === "application/pdf" ? "pdf" : "image",
        size: `${(file.size / 1024).toFixed(0)} KB`,
      }]);
      // TODO: POST file to backend /upload
    });
  };

  return (
    <div className="screen">

      {/* ── Header ── */}
      <div className="header">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="/" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 13 }} className="mono">
            ← agents
          </a>
          <span style={{ fontSize: 15, fontWeight: 500 }} className="mono">CS50x</span>
          <span className="badge badge-accent">v3</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span className="mono text-faint" style={{ fontSize: 11 }}>score</span>
          <span className="mono text-green" style={{ fontSize: 20, fontWeight: 500 }}>87</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Chat pane ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", borderRight: "1px solid var(--border)" }}>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: "flex", alignItems: "flex-end", gap: 10, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                {msg.role === "assistant" && (
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--user-bubble-bg)", border: "1px solid var(--user-bubble-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0 }} className="mono text-accent">
                    AI
                  </div>
                )}
                <div style={{
                  maxWidth: "70%", padding: "10px 14px", fontSize: 14, lineHeight: 1.6,
                  borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                  background:   msg.role === "user" ? "var(--user-bubble-bg)"    : "var(--bg-surface)",
                  border:       msg.role === "user" ? "1px solid var(--user-bubble-border)" : "1px solid var(--border-mid)",
                  color:        msg.role === "user" ? "var(--user-bubble-text)"  : "var(--text-primary)",
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--user-bubble-bg)", border: "1px solid var(--user-bubble-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0 }} className="mono text-accent">AI</div>
                <div style={{ padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--border-mid)", borderRadius: "12px 12px 12px 4px", display: "flex", gap: 4 }}>
                  <span className="dot" />
                  <span className="dot" style={{ animationDelay: "0.2s" }} />
                  <span className="dot" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: "12px 16px", borderTop: "1px solid var(--border)", background: "var(--bg)" }}>
            <textarea
              style={{ flex: 1, background: "var(--bg-surface)", border: "1px solid var(--border-mid)", borderRadius: 10, padding: "10px 14px", color: "var(--text-primary)", fontSize: 14, fontFamily: "var(--font-sans)", outline: "none", lineHeight: 1.5, maxHeight: 120, overflowY: "auto", resize: "none" }}
              placeholder="Ask your study buddy..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button className="btn-send" onClick={sendMessage} disabled={!input.trim() || loading}>↑</button>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div style={{ width: 280, display: "flex", flexDirection: "column", background: "var(--bg-deep)", flexShrink: 0 }}>

          <div className="tabs">
            {["sources", "data"].map((tab) => (
              <button key={tab} className={`tab ${sidebarTab === tab ? "active" : ""}`} onClick={() => setSidebarTab(tab)}>
                {tab}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>

            {sidebarTab === "sources" && <>
              <div
                className={`drop-zone ${dragging ? "dragging" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
              >
                <span style={{ fontSize: 22, color: "var(--text-muted)", lineHeight: 1 }}>+</span>
                <span className="mono text-faint" style={{ fontSize: 11 }}>drop pdf or image</span>
                <input ref={fileInputRef} type="file" accept=".pdf,image/jpeg,image/png" multiple style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
              </div>

              {sources.map((src) => (
                <div key={src.id} className="surface-item">
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{src.type === "pdf" ? "📄" : "🖼"}</span>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, overflow: "hidden" }}>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{src.name}</span>
                    <span className="mono text-faint" style={{ fontSize: 10 }}>{src.size}</span>
                  </div>
                  <button className="btn-icon" onClick={() => setSources((prev) => prev.filter((s) => s.id !== src.id))}>×</button>
                </div>
              ))}
            </>}

            {sidebarTab === "data" && (
              <pre className="json-block">{JSON.stringify(mockAgentData, null, 2)}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
