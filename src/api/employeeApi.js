import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL;

export const addEmployee = async (employeeData) => {
  try {
    // 驗證必填欄位 name 是否存在
    if (!employeeData.name) {
      throw new Error("Invalid input: name is required.");
    }

    // 設定預設值：若未傳入 work 或 work_hours 則預設為 1 與 0
    const payload = {
      name: employeeData.name,
      work: employeeData.work !== undefined ? employeeData.work : 1,
      work_hours:
        employeeData.work_hours !== undefined ? employeeData.work_hours : 0,
    };

    console.log("Adding employee with data:", payload);
    const response = await axios.post(`${BASE_URL}/employees`, payload);
    console.log("Employee added successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error adding employee:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
export const updateEmployeeWork = async (inputs) => {
  try {
    // 驗證必填欄位是否存在
    if (!inputs.id || inputs.work === null || inputs.work === undefined) {
      throw new Error("Invalid input: id and work are required.");
    }

    // 將 id 轉成數字並驗證
    const employeeId = Number(inputs.id);
    if (isNaN(employeeId)) {
      throw new Error("Invalid id, must be a number.");
    }

    // 驗證 work 的值必須為 0 或 1
    let work = inputs.work;
    if (work === "0" || work === 0) {
      work = 0;
    } else if (work === "1" || work === 1) {
      work = 1;
    } else {
      throw new Error("Invalid work value. Must be 0 or 1.");
    }

    const workData = { work };

    console.log("Updating employee work:", workData);
    const response = await axios.put(
      `${BASE_URL}/employees/${employeeId}/work`,
      workData
    );
    console.log("Employee work updated:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating employee work:",
      error.response ? error.response.data : error.message
    );
  }
};
export const updateEmployee = async (employeeId, updatedData) => {
  try {
    // 驗證 employeeId 是否有效
    const id = Number(employeeId);
    if (isNaN(id)) {
      throw new Error("Invalid employee id.");
    }
    // (可選) 驗證 updatedData 是否有需要更新的欄位
    if (!updatedData || Object.keys(updatedData).length === 0) {
      throw new Error("No fields to update.");
    }
    console.log("Updating employee with data:", updatedData);
    const response = await axios.put(
      `${BASE_URL}/employees/${id}`,
      updatedData
    );
    console.log("Employee updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating employee:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
// 獲取 employee 列表的 API
export const getEmployee = async () => {
  // 进行预处理检查，确保所有值都不是 null 且不是空字符串或空数组

  try {
    const response = await axios.get(`${BASE_URL}/employees`);
    // console.log("Schedule got:", response.data);
    return response.data;
    // setEvents()
  } catch (error) {
    console.error(
      "Error get employee:",
      error.response ? error.response.data : error.message
    );
  }
};
