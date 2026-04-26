import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MyDashboard from "./pages/MyDashboard";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/my-dashboard" element={<MyDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
