import React from "react";
import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import { Helmet } from "react-helmet";

import HomePage from "./pages/HomePage";
import EmployeeClandarPage from "./pages/EmployeeClandarPage";
import OverallClandarPage from "./pages/OverallClandarPage";
import FirmAnalysisPage from "./pages/FirmAnalysisPage";
import EmployeePage from "./pages/EmployeePage";
import "./index.css";
function App() {
  return (
    <BrowserRouter>
      <Helmet>
        <title>鑑界排班系統</title>
      </Helmet>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/EmployeeClandar" element={<EmployeeClandarPage />} />
        <Route path="/OverrallClandar" element={<OverallClandarPage />} />
        <Route path="/FirmAnalysis" element={<FirmAnalysisPage />} />
        <Route path="/Employee" element={<EmployeePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
