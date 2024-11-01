import React from "react";
import Sidebar from "../components/Sidebar";

const FirmAnalysisPage = () => {
  return (
    <div className="flex h-screen p-4 overflow-y-auto">
      <Sidebar />
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-6">事務所分析</h2>
        <div className="bg-white p-6 rounded-md shadow-md">
          <h3 className="text-xl font-semibold mb-4">分析概況</h3>
          <p className="text-gray-700 mb-4">
            在這裡可以查看事務所的整體分析數據，包含員工排班情況、項目完成狀況以及整體績效表現。
          </p>
          <div className="flex gap-4">
            <div className="flex-1 bg-gray-100 p-4 rounded-md">
              <h4 className="text-lg font-semibold">員工排班</h4>
              <p className="text-sm text-gray-600">查看所有員工的排班狀況。</p>
            </div>
            <div className="flex-1 bg-gray-100 p-4 rounded-md">
              <h4 className="text-lg font-semibold">項目完成率</h4>
              <p className="text-sm text-gray-600">
                追踪所有項目的進度和完成情況。
              </p>
            </div>
            <div className="flex-1 bg-gray-100 p-4 rounded-md">
              <h4 className="text-lg font-semibold">績效評估</h4>
              <p className="text-sm text-gray-600">
                查看事務所的績效評估報告。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirmAnalysisPage;
