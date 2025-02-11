import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000"; // 定義基礎 URL

// 獲取 Tasks 的 API
export const getTasks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/tasks`, {
      data: { is_scheduled: false }, // 傳遞 body 資料
    });
    console.log(response.data);
    return response.data;
  } catch (err) {
    // setError(err.message); // 捕獲錯誤訊息
    console.log(err);
  } finally {
    // setIsLoading(false); // 無論成功或失敗，結束加載
  }
};

// 新增 schedule 的 API
export const createTask = async (inputs) => {
  try {
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
    var cadastral_arrangement = false;
    if (inputs.cadastralArrangement === "是") cadastral_arrangement = true;
    const taskData = {
      office_name: inputs.office,
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
  }
};
// 新增 timePredict 的 API
export const timePredict = async (inputs) => {
  try {
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
    var cadastral_arrangement = false;
    if (inputs.cadastralArrangement === "是") cadastral_arrangement = true;
    const taskData = {
      office: inputs.office,
      adm_num: Number(inputs.landSection),
      land_num: inputs.localPoints[0],
      points: Number(inputs.stakePoints),
      area: Number(inputs.workArea),
      category: inputs.diagramOrNumeric,
      method: cadastral_arrangement,
    };

    console.log(taskData);
    const response = await axios.post(`${BASE_URL}/time_predict`, taskData);
    console.log("Task created:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating task:",
      error.response ? error.response.data : error.message
    );
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
