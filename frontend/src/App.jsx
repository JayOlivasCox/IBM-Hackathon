import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginScreen from "./LoginScreen";
import SchoolSelectScreen from "./SchoolSelectScreen";
import AgentSelectScreen from "./AgentSelectScreen";
import ChatScreen from "./ChatScreen";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <div style={{ background: "#0d0d0d", minHeight: "100vh" }} />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/school" /> : <LoginScreen />} />
        <Route path="/school" element={user ? <SchoolSelectScreen /> : <Navigate to="/" />} />
        <Route path="/agents" element={user ? <AgentSelectScreen /> : <Navigate to="/" />} />
        <Route path="/agent/:id" element={user ? <ChatScreen /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
