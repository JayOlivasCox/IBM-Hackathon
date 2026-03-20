import { signInWithGoogle } from "./firebase";
import "./global.css";

export default function LoginScreen() {
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 24
    }}>
      <h1 style={{ fontSize: 32, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
        Welcome to Grover
      </h1>
      <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
        The AI study buddy hub
      </p>
      <button
        onClick={handleLogin}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "var(--bg-surface)",
          border: "1px solid var(--border-mid)",
          borderRadius: 8,
          padding: "10px 20px",
          color: "var(--text-primary)",
          fontSize: 14,
          cursor: "pointer",
          marginTop: 8
        }}
      >
        <img src="https://www.google.com/favicon.ico" width={16} height={16} />
        Sign in with Google
      </button>
    </div>
  );
}