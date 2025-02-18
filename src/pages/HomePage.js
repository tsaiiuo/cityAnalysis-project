import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createTask, timePredict } from "../api/tasksApi";
import { postAssignSchedule, autoSchedule } from "../api/scheduleApi";
const HomePage = () => {
  const [inputs, setInputs] = useState({
    office: "永康地政事務所",
    landSection: "",
    localPoint: "", // 确保是空数组
    localPoints: [], // 确保是空数组
    stakePoints: "",
    workArea: "",
    diagramOrNumeric: "圖解區",
    cadastralArrangement: "是",
    checkTime: "",
  });
  const [choice, setChoice] = useState([]);
  const [taskID, setTaskID] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const offices = [
    "永康地政事務所",
    "佳里地政事務所",
    "安南地政事務所",
    "新化地政事務所",
    "東南地政事務所",
    "歸仁地政事務所",
    "玉井地政事務所",
    "白河地政事務所",
    "臺南地政事務所",
    "鹽水地政事務所",
    "麻豆地政事務所",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "localPoints") {
      setInputs((prev) => ({
        ...prev,
        [name]: value.split(",").map((item) => item),
      }));
      setInputs((prev) => ({
        ...prev,
        ["localPoint"]: value,
      }));
    } else {
      setInputs((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const convertToUTC = (localTime) => {
    // 將 "2024-11-19 15" 替換為 ISO 格式並創建 Date 對象
    const localDate = new Date(`${localTime}:00`); // 假設秒數是 0
    return localDate.toISOString(); // 返回 UTC 格式的 ISO 字串
  };
  const handleDateChange = (date) => {
    setInputs((prev) => ({
      ...prev,
      checkTime: date,
    }));
  };

  const handlePredict = async () => {
    console.log(inputs);
    setIsLoading(true); // 設置為 loading 狀態
    try {
      // 模擬 API 延遲

      const [taskData, timeData] = await Promise.all([
        createTask(inputs),
        timePredict(inputs),
      ]);
      //
      console.log(timeData);
      const assignScheduleData = await postAssignSchedule(
        taskData.task_id,
        timeData
      );
      var temp = [];
      temp.push(assignScheduleData.best_assignment);
      if (assignScheduleData.second_best_assignment !== "None") {
        temp.push(assignScheduleData.second_best_assignment);
      }
      console.log(temp);
      setTaskID(taskData.task_id);
      setChoice(temp);
    } catch (error) {
      console.error("API 發生錯誤", error);
    } finally {
      setIsLoading(false); // 完成後恢復為非 loading 狀態
      setIsDialogOpen(true);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen ">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center space-y-10">
        <h2 className="text-2xl font-bold">鑑界排班時間預測</h2>
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm font-bold mb-1">事務所</label>
            <select
              name="office"
              value={inputs.office}
              onChange={handleInputChange}
              className="border p-2 w-full"
            >
              {offices.map((office, index) => (
                <option key={office} value={office}>
                  {office}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">地段號</label>
            <input
              type="text"
              name="landSection"
              value={inputs.landSection}
              onChange={handleInputChange}
              className="border p-2 w-full"
              placeholder="地段號"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">地號</label>
            <input
              type="text"
              name="localPoints"
              value={inputs.localPoint}
              onChange={handleInputChange}
              className="border p-2 w-full"
              placeholder="地號"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">測釘點數</label>
            <input
              type="text"
              name="stakePoints"
              value={inputs.stakePoints}
              onChange={handleInputChange}
              className="border p-2 w-full"
              placeholder="測釘點數"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">作業面積</label>
            <input
              type="text"
              name="workArea"
              value={inputs.workArea}
              onChange={handleInputChange}
              className="border p-2 w-full"
              placeholder="作業面積"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">複丈時間</label>
            <DatePicker
              selected={inputs.checkTime}
              onChange={handleDateChange}
              showTimeSelect
              dateFormat="Pp"
              className="border p-2 w-full"
              placeholderText="選擇複丈時間"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">
              圖解區或數值區
            </label>
            <select
              name="diagramOrNumeric"
              value={inputs.diagramOrNumeric}
              onChange={handleInputChange}
              className="border p-2 w-full"
            >
              <option value="圖解區">圖解區</option>
              <option value="數值區">數值區</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">
              是否辦理地籍整理
            </label>
            <select
              name="cadastralArrangement"
              value={inputs.cadastralArrangement}
              onChange={handleInputChange}
              className="border p-2 w-full"
            >
              <option value="是">是</option>
              <option value="否">否</option>
            </select>
          </div>
        </div>

        <button
          onClick={handlePredict}
          className=" text-white p-3 mt-4 bg-gray-700 hover:bg-gray-800 w-48 text-base flex items-center justify-center"
        >
          {isLoading ? (
            <div className="animate-spin h-5 w-5 border-4 border-white border-t-transparent rounded-full"></div>
          ) : (
            "預測"
          )}
        </button>
      </div>
      {isDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md w-3/5">
            <h3 className="text-xl font-semibold mb-4">選擇下一步</h3>

            {/* 三个选项的详细说明 */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {choice.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-md border hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    console.log(convertToUTC(item.start_time));
                    autoSchedule(
                      convertToUTC(item.start_time),
                      convertToUTC(item.end_time),
                      taskID,
                      item.assigned_employee
                    );
                    console.log(`選擇 ${item.assigned_employee}`);
                    setIsDialogOpen(false);
                  }}
                >
                  <p className="text-sm text-gray-600">案件號碼：{taskID}</p>
                  <h4 className="text-lg font-bold mb-2">
                    選擇 {item.assigned_employee}
                  </h4>

                  <p className="text-sm text-gray-600">
                    所需工時：{item.required_hours} 小時
                  </p>
                  <p className="text-sm text-gray-600">排班時段：</p>
                  <p className="text-sm text-gray-600">
                    {item.assigned_slots.join(", ")}
                  </p>
                </div>
              ))}
              {choice.length > 0 && (
                <div
                  className="p-4 rounded-md border hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setIsDialogOpen(false);
                    console.log("選擇 C");
                  }}
                >
                  <h4 className="text-lg font-bold mb-2">自行彈性排班</h4>
                  <p className="text-sm text-gray-600">案件號碼：{taskID}</p>
                  <p className="text-sm text-gray-600">
                    所需工時：{choice[0].required_hours} 小時
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
