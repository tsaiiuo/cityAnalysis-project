import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000"; // 定義基礎 URL
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
