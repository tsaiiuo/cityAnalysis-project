import React from "react";
import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import EmployeeClandarPage from "./pages/EmployeeClandarPage";
import OverallClandarPage from "./pages/OverallClandarPage";
import FirmAnalysisPage from "./pages/FirmAnalysisPage";
import "./index.css";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/EmployeeClandar" element={<EmployeeClandarPage />} />
        <Route path="/OverrallClandar" element={<OverallClandarPage />} />
        <Route path="/FirmAnalysis" element={<FirmAnalysisPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
