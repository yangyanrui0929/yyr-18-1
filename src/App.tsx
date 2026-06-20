import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Archive from "@/pages/Archive";
import Header from "@/components/Header";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-cosmic-950">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/archive" element={<Archive />} />
        </Routes>
      </div>
    </Router>
  );
}
