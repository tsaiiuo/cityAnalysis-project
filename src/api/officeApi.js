import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL;

// 取得所有事務所
export const getOffices = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/offices`);
    console.log("Offices:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error getting offices:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// // 新增事務所
// export const addOffice = async (officeData) => {
//   try {
//     // officeData 應包含：name (必填)
//     const response = await axios.post(`${BASE_URL}/offices`, officeData);
//     console.log("Office added:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error(
//       "Error adding office:",
//       error.response ? error.response.data : error.message
//     );
//     throw error;
//   }
// };

// // 刪除事務所，需傳入 office_id
// export const deleteOffice = async (office_id) => {
//   try {
//     const response = await axios.delete(`${BASE_URL}/offices/${office_id}`);
//     console.log("Office deleted:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error(
//       "Error deleting office:",
//       error.response ? error.response.data : error.message
//     );
//     throw error;
//   }
// };

// // 更新事務所，需傳入 office_id 以及包含更新欄位的物件
// export const updateOffice = async (office_id, updatedFields) => {
//   try {
//     const response = await axios.put(`${BASE_URL}/offices/${office_id}`, updatedFields);
//     console.log("Office updated:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error(
//       "Error updating office:",
//       error.response ? error.response.data : error.message
//     );
//     throw error;
//   }
// };
