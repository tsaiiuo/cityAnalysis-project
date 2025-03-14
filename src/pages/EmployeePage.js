import React, { useState, useEffect, useContext } from "react";
import Sidebar from "../components/Sidebar";
import {
  updateEmployeeWork,
  getEmployee,
  addEmployee,
  updateEmployee, // 新增更新員工的 API
} from "../api/employeeApi"; // 假設 API 呼叫函式已建立
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { OfficeContext } from "../officeContext";

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { office } = useContext(OfficeContext);

  // 新增員工的 state
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    work: 1,
    work_hours: 0,
  });

  // 用於編輯員工的 state
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editEmployeeData, setEditEmployeeData] = useState({
    name: "",
    work: 1,
    work_hours: 0,
  });

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
    console.log(office);
  }, []);

  // 切換員工工作狀態
  const handleToggleWork = async (employee) => {
    const newStatus = employee.work === 1 ? 0 : 1;
    try {
      const result = await updateEmployeeWork({
        id: employee.employee_id,
        work: newStatus,
      });
      console.log("Employee updated:", result);
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.employee_id === employee.employee_id
            ? { ...emp, work: newStatus }
            : emp
        )
      );
      toast.success("員工狀態更新成功");
    } catch (error) {
      console.error("Error updating employee work:", error);
      toast.error("員工狀態更新失敗");
    }
  };

  // 新增員工功能
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const response = await addEmployee(newEmployee);
      setEmployees([...employees, response]);
      setNewEmployee({ name: "", work: 1, work_hours: 0 });
      toast.success("新增員工成功");
    } catch (error) {
      console.error("Error adding employee:", error);
      toast.error("新增員工失敗");
    }
  };

  // 開啟編輯 dialog，並預設填入該員工資料
  const openEditDialog = (employee) => {
    setEmployeeToEdit(employee);
    setEditEmployeeData({
      name: employee.name,
      work: employee.work,
      work_hours: employee.work_hours,
    });
    setShowEditDialog(true);
  };

  // 送出編輯，呼叫 updateEmployee API 更新資料
  const handleUpdateEmployee = async () => {
    try {
      const updated = await updateEmployee(
        employeeToEdit.employee_id,
        editEmployeeData
      );
      toast.success("員工資料更新成功");
      // 更新本地 state
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.employee_id === employeeToEdit.employee_id
            ? { ...emp, ...editEmployeeData }
            : emp
        )
      );
      setShowEditDialog(false);
      setEmployeeToEdit(null);
    } catch (error) {
      toast.error("員工資料更新失敗");
      console.error("Error updating employee:", error);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
      <Sidebar />

      <div className="w-2/3 p-10 overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          員工工作狀態管理
        </h2>

        {/* 新增員工區域 */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold mb-4 text-gray-800">新增員工</h3>
          <form onSubmit={handleAddEmployee}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  姓名
                </label>
                <input
                  type="text"
                  name="name"
                  value={newEmployee.name}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, name: e.target.value })
                  }
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入員工姓名"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md shadow transition-colors duration-150"
                >
                  新增員工
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* 員工資料表 */}
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
                        <button
                          onClick={() => openEditDialog(employee)}
                          className="ml-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-md shadow transition-colors duration-150"
                        >
                          編輯
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
      <ToastContainer position="bottom-right" />

      {/* 編輯員工 dialog */}
      {showEditDialog && employeeToEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">編輯員工資訊</h3>
            <div className="mb-2">
              <label className="block text-sm font-bold">姓名</label>
              <input
                type="text"
                value={editEmployeeData.name}
                onChange={(e) =>
                  setEditEmployeeData({
                    ...editEmployeeData,
                    name: e.target.value,
                  })
                }
                className="border p-2 w-full"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-bold">工作狀態</label>
              <select
                value={editEmployeeData.work}
                onChange={(e) =>
                  setEditEmployeeData({
                    ...editEmployeeData,
                    work: Number(e.target.value),
                  })
                }
                className="border p-2 w-full"
              >
                <option value={1}>工作中</option>
                <option value={0}>非工作中</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold">總工時</label>
              <input
                type="number"
                value={editEmployeeData.work_hours}
                onChange={(e) =>
                  setEditEmployeeData({
                    ...editEmployeeData,
                    work_hours: Number(e.target.value),
                  })
                }
                className="border p-2 w-full"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleUpdateEmployee}
                className="bg-green-500 text-white px-3 py-2 rounded-md"
              >
                更新
              </button>
              <button
                onClick={() => setShowEditDialog(false)}
                className="bg-gray-500 text-white px-3 py-2 rounded-md"
              >
                取消
              </button>
            </div>
            <button
              onClick={() => setShowEditDialog(false)}
              className="absolute top-2 right-2 text-gray-500"
            >
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePage;
