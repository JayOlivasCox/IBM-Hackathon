import { BrowserRouter, Routes, Route } from "react-router-dom"
import AgentSelectScreen from "./AgentSelectScreen"
import ChatScreen from "./ChatScreen"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<AgentSelectScreen />} />
        <Route path="/agent/:id"  element={<ChatScreen />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App