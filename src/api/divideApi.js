import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000"; // 定義基礎 URL

// 取得所有分割記錄
export const getDivideRecords = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/divide_records`);
      console.log("Divide records:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error getting divide records:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  };
  
  // 新增分割記錄
  export const addDivideRecord = async (record) => {
    try {
      // record 應包含：employee_id, start_time, end_time,location_num ,land_num
      const response = await axios.post(`${BASE_URL}/divide_records`, record);
      console.log("Divide record added:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error adding divide record:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  };
  
  // 刪除請假記錄，需傳入 leave_id
  export const deleteDivideRecord = async (divide_id) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/divide_records/${divide_id}`
      );
      console.log("Divide record deleted:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error deleting divide record:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  };
  
  // 更新請假記錄，需傳入 leave_id 以及包含更新欄位的物件
  export const updateDivideRecord = async (divide_id, updatedFields) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/divide_records/${divide_id}`,
        updatedFields
      );
      console.log("Divide record updated:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error updating divide record:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  };