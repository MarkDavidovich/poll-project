import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreatePoll from "./pages/CreatePoll";
import PollView from "./pages/PollView";

function App() {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={<CreatePoll />} />
          <Route path="/poll/:id" element={<PollView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
