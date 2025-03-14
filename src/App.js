import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Helmet } from "react-helmet";
import { OfficeProvider } from "./officeContext";
import OfficeGuard from "./OfficeGuard";

import HomePage from "./pages/HomePage";
import EmployeeClandarPage from "./pages/EmployeeClandarPage";
import OverallClandarPage from "./pages/OverallClandarPage";
import FirmAnalysisPage from "./pages/FirmAnalysisPage";
import EmployeePage from "./pages/EmployeePage";
import OfficeSelectionPage from "./pages/OfficeSelectionPage";

import "./index.css";

function App() {
  return (
    <OfficeProvider>
      <BrowserRouter>
        <Helmet>
          <title>鑑界排班系統</title>
        </Helmet>
        <Routes>
          {/* 不受保護的路由 */}
          <Route path="/office-selection" element={<OfficeSelectionPage />} />
          {/* 受 OfficeGuard 保護的路由 */}
          <Route element={<OfficeGuard />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/EmployeeClandar" element={<EmployeeClandarPage />} />
            <Route path="/OverrallClandar" element={<OverallClandarPage />} />
            <Route path="/FirmAnalysis" element={<FirmAnalysisPage />} />
            <Route path="/Employee" element={<EmployeePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </OfficeProvider>
  );
}

export default App;
