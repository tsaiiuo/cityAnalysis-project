import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL;
// 刪除 schedule 的 API
export const deleteSchedule = async (event) => {
  try {
    console.log({
      schedule_id: event.schedule_id,
      employee_id: event.employee_id,
      start_time: event.start,
      end_time: event.end,
    });
    const response = await axios.delete(`${BASE_URL}/schedule`, {
      data: {
        schedule_id: event.schedule_id,
        employee_id: event.employee_id,
        start_time: event.start,
        end_time: event.end,
      },
    });

    // 請求成功，顯示結果
    console.log(response.data);
    alert("Schedule deleted successfully!");
  } catch (error) {
    // 處理錯誤
    console.error("Error deleting schedule:", error);
    alert("Failed to delete schedule. Please try again.");
  }
};

// 新增 schedule 的 API
export const createSchedule = async (
  start,
  end,
  selectedTask,
  selectedName
) => {
  // 进行预处理检查，确保所有值都不是 null 且不是空字符串或空数组

  try {
    const scheduleData = {
      start_time: start,
      end_time: end,
      name: selectedName,
      task_id: Number(selectedTask),
    };
    console.log(scheduleData);
    for (const [key, value] of Object.entries(scheduleData)) {
      if (
        value === null ||
        value === "" ||
        (typeof value === "string" && value.trim().length === 0)
      ) {
        throw new Error(
          `Invalid value for ${key}. Value cannot be null or empty.`
        );
      }
    }
    console.log(scheduleData);
    const response = await axios.post(`${BASE_URL}/schedule`, scheduleData);
    console.log("Schedule created:", response.data);
  } catch (error) {
    console.error(
      "Error creating Schedule:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
export const autoSchedule = async (start, end, selectedTask, selectedName) => {
  // 进行预处理检查，确保所有值都不是 null 且不是空字符串或空数组

  try {
    var end_time = new Date(end);
    end_time.setHours(end_time.getHours() + 1);

    end_time = end_time.toISOString();
    const scheduleData = {
      start_time: start,
      end_time: end_time,
      name: selectedName,
      task_id: Number(selectedTask),
    };
    console.log(end);
    console.log(scheduleData);

    for (const [key, value] of Object.entries(scheduleData)) {
      if (
        value === null ||
        value === "" ||
        (typeof value === "string" && value.trim().length === 0)
      ) {
        throw new Error(
          `Invalid value for ${key}. Value cannot be null or empty.`
        );
      }
    }
    console.log(scheduleData);
    const response = await axios.post(`${BASE_URL}/schedule`, scheduleData);
    console.log("Schedule created:", response.data);
  } catch (error) {
    console.error(
      "Error creating Schedule:",
      error.response ? error.response.data : error.message
    );
  }
};

// 獲取 schedule 列表的 API
export const getSchedule = async (office_id) => {
  try {
    let url = `${BASE_URL}/schedule`;
    if (office_id) {
      url += `?office_id=${encodeURIComponent(office_id)}`;
    }
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(
      "Error getting schedule:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const postAssignSchedule = async (
  task_id,
  office_id,
  required_hours
) => {
  const data = {
    task_id,
    office_id,
    required_hours,
  };
  console.log(data);

  try {
    const response = await axios.post(`${BASE_URL}/assign_task`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Response:", response.data); // 成功響應
    return response.data; // 返回響應數據
  } catch (error) {
    if (error.response) {
      console.error("Error Response:", error.response.data); // API 返回的錯誤信息
    } else {
      console.error("Error:", error.message); // 請求本身的錯誤信息
    }
    throw error; // 向外層傳遞錯誤
  }
};
