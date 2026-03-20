import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, signOutUser } from "./firebase";
import "./global.css";

const SCHOOLS = [
  // UC System
  "UC Berkeley (UCB)",
  "UC Los Angeles (UCLA)",
  "UC San Diego (UCSD)",
  "UC Davis (UCD)",
  "UC Santa Barbara (UCSB)",
  "UC Irvine (UCI)",
  "UC Santa Cruz (UCSC)",
  "UC Riverside (UCR)",
  "UC Merced (UCM)",
  "UC San Francisco (UCSF)",
  // CSU System
  "Cal State LA (CSULA)",
  "Cal State Long Beach (CSULB)",
  "Cal State Fullerton (CSUF)",
  "Cal State Northridge (CSUN)",
  "Cal State San Bernardino (CSUSB)",
  "Cal State Dominguez Hills (CSUDH)",
  "Cal State Bakersfield (CSUB)",
  "Cal State Channel Islands (CSUCI)",
  "Cal State East Bay (CSUEB)",
  "Cal State Fresno (Fresno State)",
  "Cal State Humboldt (HSU)",
  "Cal State Monterey Bay (CSUMB)",
  "Cal State Pomona (CPP)",
  "Cal State Sacramento (Sac State)",
  "Cal State San Diego (SDSU)",
  "Cal State San Francisco (SFSU)",
  "Cal State San Jose (SJSU)",
  "Cal State San Luis Obispo (Cal Poly SLO)",
  "Cal State San Marcos (CSUSM)",
  "Cal State Sonoma (SSU)",
  "Cal State Stanislaus (CSU Stan)",
  "Cal Maritime (CSUM)",
  // Other
  "Stanford University",
  "USC (University of Southern California)",
];

export default function SchoolSelectScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const user = auth.currentUser;

  const filtered = SCHOOLS.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
    }}>

      {/* Sign out button */}
      <div style={{ position: "absolute", top: 20, right: 24 }}>
        <button
          onClick={signOutUser}
          style={{
            background: "none",
            border: "1px solid var(--border-mid)",
            borderRadius: 8,
            color: "var(--text-muted)",
            fontSize: 12,
            padding: "6px 14px",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
          }}
        >
          sign out
        </button>
      </div>

      {/* Welcome message */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <p className="mono text-faint" style={{ fontSize: 11, marginBottom: 8 }}>
          welcome back
        </p>
        <h1 style={{
          fontSize: 32,
          fontWeight: 500,
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
          marginBottom: 8
        }}>
          {user?.displayName ?? "Student"}
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
          Let's find your school to get started
        </p>
      </div>

      {/* Search box */}
      <div style={{ width: "100%", maxWidth: 480, position: "relative" }}>

        {/* Label with arrow */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
          color: "var(--accent)",
        }}>
          <span style={{ fontSize: 13, fontFamily: "var(--font-mono)" }}>
            ↓ search your school here
          </span>
        </div>

        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Cal State LA, UCLA..."
          style={{
            width: "100%",
            background: "var(--bg-surface)",
            border: "1px solid var(--accent)",
            borderRadius: 10,
            padding: "14px 18px",
            color: "var(--text-primary)",
            fontSize: 15,
            fontFamily: "var(--font-sans)",
            outline: "none",
            boxShadow: "0 0 0 3px var(--accent-bg)",
          }}
        />

        {/* Results dropdown */}
        {query && (
          <div style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-mid)",
            borderRadius: 10,
            marginTop: 6,
            overflow: "hidden",
            zIndex: 10,
            maxHeight: 300,
            overflowY: "auto",
          }}>
            {filtered.length > 0 ? filtered.map((school) => (
              <div
                key={school}
                onClick={() => navigate("/agents")}
                style={{
                  padding: "12px 18px",
                  fontSize: 14,
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  borderBottom: "1px solid var(--border)",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-item)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                {school}
              </div>
            )) : (
              <div style={{ padding: "12px 18px", fontSize: 13, color: "var(--text-muted)" }}>
                No schools found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}