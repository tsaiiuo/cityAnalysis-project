// OfficeGuard.js
import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { OfficeContext } from "./officeContext"; // 根據實際路徑調整

const OfficeGuard = () => {
  const { office } = useContext(OfficeContext);
  // 若 office 已設定則渲染子路由，否則導向 OfficeSelectionPage
  return office ? <Outlet /> : <Navigate to="/office-selection" />;
};

export default OfficeGuard;
