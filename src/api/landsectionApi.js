import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL;
// 取得所有事務所
export const getLandSections = async (office_id = null) => {
    try {
      // 根據有無 office_id，決定請求的 URL
      const url = office_id
        ? `${BASE_URL}/land_sections?office_id=${office_id}`
        : `${BASE_URL}/land_sections`;
  
      const response = await axios.get(url);
      console.log("Land Sections:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error getting land sections:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  };