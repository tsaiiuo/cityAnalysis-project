import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { updateEmployeeWork, getEmployee } from "../api/employeeApi"; // 已建立的 API 呼叫函式

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 取得所有員工資料
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await getEmployee();
      console.log(response);
      setEmployees(response);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // 切換員工工作狀態（若目前 work 為 1，則切換為 0，反之亦然）
  const handleToggleWork = async (employee) => {
    const newStatus = employee.work === 1 ? 0 : 1;
    try {
      const result = await updateEmployeeWork({
        id: employee.employee_id,
        work: newStatus,
      });
      console.log("Employee updated:", result);
      // 更新 state 中該筆員工的狀態
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.employee_id === employee.employee_id
            ? { ...emp, work: newStatus }
            : emp
        )
      );
    } catch (error) {
      console.error("Error updating employee work:", error);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          員工工作狀態管理
        </h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">載入中...</div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    員工ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    姓名
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    工作狀態
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    總工時
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.length === 0 ? (
                  <tr>
                    <td className="px-6 py-4 text-center" colSpan="5">
                      尚無員工資料
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr
                      key={employee.employee_id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {employee.employee_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {employee.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            employee.work === 1
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {employee.work === 1 ? "工作中" : "非工作中"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {employee.work_hours}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleToggleWork(employee)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md shadow transition-colors duration-150"
                        >
                          {employee.work === 1 ? "設定為非工作" : "設定為工作"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeePage;
