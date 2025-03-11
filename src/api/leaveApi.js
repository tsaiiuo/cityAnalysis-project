import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000"; // 定義基礎 URL

// 取得所有請假記錄
export const getLeaveRecords = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/leave_records`);
    console.log("Leave records:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error getting leave records:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// 新增請假記錄
export const addLeaveRecord = async (record) => {
  try {
    // record 應包含：employee_id, start_time, end_time, leave_type
    // reason 為可選欄位
    const response = await axios.post(`${BASE_URL}/leave_records`, record);
    console.log("Leave record added:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error adding leave record:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// 刪除請假記錄，需傳入 leave_id
export const deleteLeaveRecord = async (leave_id) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/leave_records/${leave_id}`
    );
    console.log("Leave record deleted:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting leave record:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// 更新請假記錄，需傳入 leave_id 以及包含更新欄位的物件
export const updateLeaveRecord = async (leave_id, updatedFields) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/leave_records/${leave_id}`,
      updatedFields
    );
    console.log("Leave record updated:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating leave record:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
