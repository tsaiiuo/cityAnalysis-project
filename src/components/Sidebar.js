import React from "react";

const Sidebar = () => {
  return (
    <div className="w-full lg:w-1/6 bg-white text-black p-6 border-b-2 lg:border-b-0 lg:border-r-2 border-black">
      <h2 className="text-2xl font-bold mb-6">Sidebar</h2>
      <ul className="space-y-4">
        <li>
          <a
            href="/"
            className="block p-4 text-lg hover:bg-black hover:text-white hover:rounded-full"
          >
            Home
          </a>
        </li>
        <li>
          <a
            href="EmployeeClandar"
            className="block p-4 text-lg hover:bg-black hover:text-white hover:rounded-full"
          >
            EmployeeClander
          </a>
        </li>
        <li>
          <a
            href="/OverrallClandar"
            className="block p-4 text-lg hover:bg-black hover:text-white hover:rounded-full"
          >
            OverrallClander
          </a>
        </li>
        <li>
          <a
            href="/FirmAnalysis"
            className="block p-4 text-lg hover:bg-black hover:text-white hover:rounded-full"
          >
            FirmAnalysis
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
