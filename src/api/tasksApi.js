import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL;
// 獲取 Tasks 的 API
export const getTasks = async (is_scheduled = false, office_id = null) => {
  try {
    const params = { is_scheduled };
    if (office_id) {
      params.office_id = office_id;
    }
    const response = await axios.get(`${BASE_URL}/tasks`, { params });
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.log(err);
  } finally {
    // 你可以在此處關閉加載狀態
  }
};

export const timePredict = async (inputs) => {
  try {
    // 驗證 inputs
    for (const [key, value] of Object.entries(inputs)) {
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
    const cadastral_arrangement = inputs.cadastralArrangement === "是";
    const taskData = {
      office: inputs.office,
      office_id: inputs.office_id,
      adm_num: Number(inputs.landSection),
      land_num: inputs.localPoints[0],
      points: Number(inputs.stakePoints),
      area: Number(inputs.workArea),
      category: inputs.diagramOrNumeric,
      method: cadastral_arrangement,
    };

    console.log(taskData);
    const response = await axios.post(`${BASE_URL}/time_predict`, taskData);
    console.log("Time predict result:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error in timePredict:",
      error.response ? error.response.data : error.message
    );
    // 重新拋出錯誤，讓外層可以捕捉到
    throw error;
  }
};

export const createTask = async (inputs) => {
  try {
    // 驗證 inputs
    for (const [key, value] of Object.entries(inputs)) {
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
    const cadastral_arrangement = inputs.cadastralArrangement === "是";
    const taskData = {
      office_name: inputs.office,
      office_id: inputs.office_id,
      land_section: Number(inputs.landSection),
      local_point: inputs.localPoint,
      stake_point: Number(inputs.stakePoints),
      work_area: Number(inputs.workArea),
      check_time: inputs.checkTime,
      diagramornumeric: inputs.diagramOrNumeric,
      cadastral_arrangement: cadastral_arrangement,
    };

    console.log(taskData);
    const response = await axios.post(`${BASE_URL}/tasks`, taskData);
    console.log("Task created:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating task:",
      error.response ? error.response.data : error.message
    );
    // 重新拋出錯誤，讓外層可以捕捉到
    throw error;
  }
};
export const completeTask = async (selectedEvent, taskEndDate) => {
  try {
    // 驗證 selectedEvent 與 taskEndDate
    if (!selectedEvent || !selectedEvent.task_id) {
      throw new Error("Invalid selectedEvent: task_id is required.");
    }
    if (
      taskEndDate === null ||
      taskEndDate === "" ||
      (typeof taskEndDate === "string" && taskEndDate.trim().length === 0)
    ) {
      throw new Error("Invalid taskEndDate. Value cannot be null or empty.");
    }

    // 使用 axios 送出 PUT 請求，將 taskEndDate 當作 current_time 傳遞給後端
    const response = await axios.put(
      `${BASE_URL}/tasks/complete/${selectedEvent.task_id}`,
      { current_time: taskEndDate }
    );
    console.log("Task completed:", response.data);

    alert("任務已順利完成!");
    return response.data;
  } catch (error) {
    console.error(
      "Error completing task:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const updateTask = async (task_id, inputs) => {
  try {
    // 驗證 inputs
    for (const [key, value] of Object.entries(inputs)) {
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

    const taskData = {
      local_point: inputs.local_point,
      stake_point: Number(inputs.stake_point),
      work_area: Number(inputs.work_area),
      check_time: inputs.check_time,
    };

    console.log("Updating task with data:", taskData);
    const response = await axios.put(`${BASE_URL}/tasks/${task_id}`, taskData);
    console.log("Task updated:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating task:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// 獲取 schedule 列表的 API
export const getSchedule = async () => {
  // 进行预处理检查，确保所有值都不是 null 且不是空字符串或空数组

  try {
    const response = await axios.get(`${BASE_URL}/schedule`);
    // console.log("Schedule got:", response.data);
    return response.data;
    // setEvents()
  } catch (error) {
    console.error(
      "Error get Schedule:",
      error.response ? error.response.data : error.message
    );
  }
};
