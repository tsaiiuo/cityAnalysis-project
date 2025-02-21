import React, { useState } from "react";
import { GoSidebarCollapse } from "react-icons/go";
import { GoSidebarExpand } from "react-icons/go";
import { FaGithub } from "react-icons/fa";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`${
        isCollapsed ? "w-1/10" : "w-full lg:w-1/5 h-screen"
      } transition-all duration-300  text-black pt-2 pl-6 pr-6 bg-slate-100 `}
    >
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center  justify-start mb-4 text-2xl font-semibold text-black p-2 hover:text-blue-500 "
        >
          <GoSidebarCollapse />
        </button>
      )}

      {!isCollapsed && (
        <>
          <div className="flex items-center justify-between mb-4">
            <a
              href="https://github.com/tsaiiuo/cityAnalysis-project"
              className="text-2xl font-semibold text-black p-2 hover:text-blue-500"
            >
              <FaGithub />
            </a>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-2xl font-semibold text-black p-2 hover:text-blue-500"
            >
              {isCollapsed ? <GoSidebarCollapse /> : <GoSidebarExpand />}
            </button>
          </div>
          <h2 className="text-2xl font-bold mb-6 p-4">鑑界排班</h2>
          <ul className="space-y-4">
            <li>
              <a
                href="/"
                className="block p-4 text-lg hover:bg-black hover:text-white hover:rounded-md"
              >
                鑑界排班時間預測
              </a>
            </li>
            <li>
              <a
                href="Employee"
                className="block p-4 text-lg hover:bg-black hover:text-white hover:rounded-md"
              >
                員工上班狀態
              </a>
            </li>
            <li>
              <a
                href="EmployeeClandar"
                className="block p-4 text-lg hover:bg-black hover:text-white hover:rounded-md"
              >
                員工排班
              </a>
            </li>
            <li>
              <a
                href="/OverrallClandar"
                className="block p-4 text-lg hover:bg-black hover:text-white hover:rounded-md"
              >
                整體班表
              </a>
            </li>
            <li>
              <a
                href="/FirmAnalysis"
                className="block p-4 text-lg hover:bg-black hover:text-white hover:rounded-md"
              >
                事務所分析
              </a>
            </li>
          </ul>
        </>
      )}
    </div>
  );
};

export default Sidebar;
