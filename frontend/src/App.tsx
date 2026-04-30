import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MyDashboard from "./pages/MyDashboard";
import BountyDetail from "./pages/BountyDetail";
import Leaderboard from "./pages/Leaderboard";
import Metrics from "./pages/Metrics";
import { ToastContainer } from "./components/Toast";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/my-dashboard" element={<MyDashboard />} />
        <Route path="/bounty/:id" element={<BountyDetail />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/metrics" element={<Metrics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
