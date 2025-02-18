import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000"; // 定義基礎 URL

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
