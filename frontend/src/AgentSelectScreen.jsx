import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import "./global.css";

const SCHOOL = "Cal State LA";

const PROFESSORS = ["Prof. Malan", "Prof. Hardison", "Prof. Wengrow"];

const CLASSES = {
  "Prof. Malan":    ["CS50", "CS51", "CS61"],
  "Prof. Hardison": ["CS121", "CS124"],
  "Prof. Wengrow":  ["CS201", "CS202"],
};

const SEMESTERS = ["Fall", "Spring", "Summer"];
const YEARS     = ["2023", "2024", "2025", "2026"];

const AGENTS = [
  { id: "agent_cs50_v3", name: "CS50x Agent",    version: 3, score: "A+", forks: 7, author: "noah-fall-25" },
  { id: "agent_cs50_v2", name: "CS50x Agent",    version: 2, score: "B+", forks: 4,  author: "alex-winter-23" },
  { id: "agent_cs50_v1", name: "CS50x Agent",    version: 1, score: "C+", forks: 1,  author: "sara-summer-24" },
  { id: "agent_cs51_v1", name: "CS51 Agent",     version: 1, score: "B", forks: 2,  author: "marco-spring-22" },
  { id: "agent_cs61_v2", name: "CS61 Agent",     version: 2, score: "D-", forks: 0,  author: "andrew-fall-23" },
  { id: "agent_cs61_v1", name: "CS61 Agent",     version: 1, score: "A", forks: 3,  author: "lisa-fall-23" },
];

function scoreColor(score) {
  if (score.includes('A') || score.includes('B')) return "var(--green)";
  if (score.includes('C')) return  "#f0c040";
  return "#e05555";
}


/* ── Add Agent Modal ── */
function AddModal({ onClose, onCreate }) {
  const [name, setName]         = useState("");
  const [semester, setSemester] = useState("");
  const [year, setYear]         = useState("");
  const [file, setFile]         = useState(null);
  const fileRef = useRef(null);

  const canSubmit = name.trim() && semester && year;

  const handleCreate = () => {
    if (!canSubmit) return;
    onCreate({ name, semester, year, file });
    onClose();
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 500, color: "var(--text-primary)" }}>new agent</h2>
          <button className="btn-icon" onClick={onClose} style={{ fontSize: 20 }}>×</button>
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>name</label>
          <input
            style={inputStyle}
            placeholder="e.g. CS50x Spring 2025"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ ...fieldWrap, flex: 1 }}>
            <label style={labelStyle}>semester</label>
            <select style={inputStyle} value={semester} onChange={(e) => setSemester(e.target.value)}>
              <option value="" disabled>select</option>
              {SEMESTERS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ ...fieldWrap, flex: 1 }}>
            <label style={labelStyle}>year</label>
            <select style={inputStyle} value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="" disabled>select</option>
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>base materials <span style={{ color: "var(--text-faint)" }}>(optional)</span></label>
          <div
            style={{ ...dropSmall, ...(file ? { borderColor: "var(--accent)" } : {}) }}
            onClick={() => fileRef.current?.click()}
          >
            <span style={{ fontSize: 13, color: file ? "var(--accent)" : "var(--text-faint)" }}>
              {file ? file.name : "+ add pdf or image"}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,image/jpeg,image/png"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
          </div>
        </div>

        <button
          onClick={handleCreate}
          style={{
            ...createBtnStyle,
            opacity: canSubmit ? 1 : 0.4,
            cursor: canSubmit ? "pointer" : "default",
          }}
          disabled={!canSubmit}
        >
          create agent
        </button>
      </div>
    </div>
  );
}

/* ── Agent Summary Panel ── */
function SummaryPanel({ agent, onClose, onOpen }) {
  const categories = { accuracy: 91, usefulness: 88, verbosity: 74, result: 85 };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={summaryStyle} onClick={(e) => e.stopPropagation()}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 18, fontWeight: 500, color: "var(--text-primary)" }}>{agent.name}</span>
              <span className="badge badge-accent">v{agent.version}</span>
            </div>
            <span className="mono text-faint" style={{ fontSize: 11 }}>{agent.author} · {agent.semester} {agent.year}</span>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ fontSize: 20 }}>×</button>
        </div>

        {/* Score */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 20 }}>
          <span className="mono" style={{ fontSize: 36, fontWeight: 500, color: scoreColor(agent.score) }}>{agent.score}</span>
          <span className="mono text-faint" style={{ fontSize: 12 }}>/100</span>
        </div>

        {/* Category bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {Object.entries(categories).map(([key, val]) => (
            <div key={key}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span className="mono text-faint" style={{ fontSize: 10 }}>{key}</span>
                <span className="mono" style={{ fontSize: 10, color: scoreColor(val) }}>{val}</span>
              </div>
              <div style={{ height: 3, background: "var(--border-mid)", borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${val}%`, background: scoreColor(val), borderRadius: 2, transition: "width 0.4s ease" }} />
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 24 }}>
          {agent.description}
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <span className="mono text-faint" style={{ fontSize: 11 }}>{agent.forks} forks</span>
          <button onClick={() => onOpen(agent.id)} style={createBtnStyle}>
            open agent →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Screen ── */
export default function AgentSelectScreen() {
  const navigate = useNavigate();
  const [agents, setAgents]           = useState(INITIAL_AGENTS);
  const [showAdd, setShowAdd]         = useState(false);
  const [selectedAgent, setSelected]  = useState(null);

  const handleCreate = ({ name, semester, year }) => {
    const newAgent = {
      id: `agent_new_${Date.now()}`,
      name,
      version: 1,
      score: null,
      forks: 0,
      author: "you",
      course: name,
      semester,
      year,
      description: "Freshly created. No score yet.",
    };
    setAgents((prev) => [newAgent, ...prev]);
    navigate(`/agent/${newAgent.id}`);
  };

  return (
    <div className="screen" style={{ overflowY: "auto" }}>
      <div style={{ padding: "40px 48px" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
          <div>
            <p className="mono text-faint" style={{ fontSize: 11, marginBottom: 6 }}>institution</p>
            <h1 style={{ fontSize: 28, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              {SCHOOL}
            </h1>
          </div>
          <button onClick={() => setShowAdd(true)} style={addBtnStyle}>
            + new agent
          </button>
        </div>

        {/* ── Filters ── */}
        <div style={{ display: "flex", gap: 16, marginBottom: 40, flexWrap: "wrap" }}>
          <div style={filterWrap}>
            <label className="mono text-faint" style={{ fontSize: 10 }}>professor</label>
            <select style={selectStyle} defaultValue="">
              <option value="" disabled>select</option>
              {PROFESSORS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div style={filterWrap}>
            <label className="mono text-faint" style={{ fontSize: 10 }}>class</label>
            <select style={selectStyle} defaultValue="">
              <option value="" disabled>select</option>
              {Object.values(CLASSES).flat().map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* ── Agent grid ── */}
        <p className="mono text-faint" style={{ fontSize: 10, marginBottom: 16, letterSpacing: "0.08em" }}>
          {agents.length} agents
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => setSelected(agent)}
              style={cardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.background  = "var(--bg-surface)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-mid)";
                e.currentTarget.style.background  = "var(--bg-item)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <span className="badge badge-accent" style={{ fontSize: 10 }}>v{agent.version}</span>
                <span className="mono" style={{ fontSize: 18, fontWeight: 500, color: agent.score ? scoreColor(agent.score) : "var(--text-faint)" }}>
                  {agent.score ?? "—"}
                </span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>{agent.name}</p>
              <p className="mono text-faint" style={{ fontSize: 10, marginBottom: 16 }}>{agent.author}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                <span className="mono text-faint" style={{ fontSize: 10 }}>{agent.forks} forks</span>
                <span style={{ fontSize: 12, color: "var(--accent)" }}>view →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modals ── */}
      {showAdd && (
        <AddModal onClose={() => setShowAdd(false)} onCreate={handleCreate} />
      )}
      {selectedAgent && (
        <SummaryPanel
          agent={selectedAgent}
          onClose={() => setSelected(null)}
          onOpen={(id) => navigate(`/agent/${id}`)}
        />
      )}
    </div>
  );
}

/* ── Shared styles ── */
const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
};

const modalStyle = {
  background: "var(--bg-surface)",
  border: "1px solid var(--border-mid)",
  borderRadius: 16,
  padding: 28,
  width: 420,
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const summaryStyle = {
  background: "var(--bg-surface)",
  border: "1px solid var(--border-mid)",
  borderRadius: 16,
  padding: 28,
  width: 380,
};

const fieldWrap = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const labelStyle = {
  fontSize: 10,
  fontFamily: "var(--font-mono)",
  color: "var(--text-faint)",
  letterSpacing: "0.05em",
};

const inputStyle = {
  background: "var(--bg-item)",
  border: "1px solid var(--border-mid)",
  borderRadius: "var(--radius-md)",
  color: "var(--text-primary)",
  fontSize: 13,
  fontFamily: "var(--font-sans)",
  padding: "9px 12px",
  outline: "none",
  width: "100%",
};

const dropSmall = {
  border: "1px dashed var(--border-muted)",
  borderRadius: "var(--radius-md)",
  padding: "12px 14px",
  cursor: "pointer",
  transition: "border-color 0.15s",
};

const createBtnStyle = {
  background: "var(--accent)",
  border: "none",
  borderRadius: "var(--radius-md)",
  color: "#000",
  fontSize: 13,
  fontWeight: 500,
  fontFamily: "var(--font-sans)",
  padding: "9px 18px",
  cursor: "pointer",
};

const addBtnStyle = {
  background: "none",
  border: "1px solid var(--accent)",
  borderRadius: "var(--radius-md)",
  color: "var(--accent)",
  fontSize: 13,
  fontFamily: "var(--font-sans)",
  padding: "9px 16px",
  cursor: "pointer",
};

const filterWrap = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const selectStyle = {
  background: "var(--bg-surface)",
  border: "1px solid var(--border-mid)",
  borderRadius: "var(--radius-md)",
  color: "var(--text-primary)",
  fontSize: 13,
  fontFamily: "var(--font-sans)",
  padding: "8px 12px",
  outline: "none",
  cursor: "pointer",
  minWidth: 180,
};

const cardStyle = {
  background: "var(--bg-item)",
  border: "1px solid var(--border-mid)",
  borderRadius: 16,
  padding: "16px",
  cursor: "pointer",
  transition: "border-color 0.15s, background 0.15s",
};
