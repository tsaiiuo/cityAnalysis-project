import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createTask, timePredict } from "../api/tasksApi";
import { getEmployee } from "../api/employeeApi";
import { postAssignSchedule, autoSchedule } from "../api/scheduleApi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 根據 office 回傳對應的地段號選項
const getLandSectionOptions = (office) => {
  const mapping = {
    鹽水地政事務所: [
      { name: "東昇段", value: "2063" },
      { name: "新東段", value: "2079" },
      { name: "水秀段", value: "2067" },
    ],
    玉井地政事務所: [
      { name: "玉井段", value: "8000" },
      { name: "芒子芒段", value: "8005" },
      { name: "中坑段", value: "8015" },
      { name: "密枝段", value: "8009" },
    ],
    // 佳里地政事務所: [
    //   { name: "佳里段X", value: "4001" },
    //   { name: "佳里段Y", value: "4002" },
    // ],
    // 其他事務所可以依需求加入...
  };
  return mapping[office] || mapping["鹽水地政事務所"];
};

const HomePage = () => {
  const location = useLocation();

  const [inputs, setInputs] = useState({
    office: "玉井地政事務所",
    landSection: "", // 儲存最後選取的數值
    localPoint: "",
    localPoints: [],
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
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeFlex, setSelectedEmployeeFlex] = useState("");

  // 新增：地段號自動完成相關 state
  const [landSectionQuery, setLandSectionQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 定義事務所選項
  const offices = [
    // "永康地政事務所",
    // "佳里地政事務所",
    // "安南地政事務所",
    // "新化地政事務所",
    // "東南地政事務所",
    // "歸仁地政事務所",
    "玉井地政事務所",
    // "白河地政事務所",
    // "臺南地政事務所",
    "鹽水地政事務所",
    // "麻豆地政事務所",
  ];

  // 讀取 URL 中的 office 參數並設定到 inputs.office
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const officeParam = searchParams.get("office");
    if (officeParam) {
      setInputs((prev) => ({ ...prev, office: officeParam }));
    }
  }, [location.search]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeeData = await getEmployee();
        setEmployees(employeeData);
        if (employeeData && employeeData.length > 0) {
          setSelectedEmployeeFlex(employeeData[0].name);
        }
      } catch (error) {
        console.error("Error fetching employees", error);
      }
    };
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "localPoints") {
      setInputs((prev) => ({
        ...prev,
        [name]: value.split(",").map((item) => item),
        localPoint: value,
      }));
    } else {
      setInputs((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const convertToUTC = (localTime) => {
    const localDate = new Date(`${localTime}:00`);
    return localDate.toISOString();
  };

  const handleDateChange = (date) => {
    setInputs((prev) => ({
      ...prev,
      checkTime: date,
    }));
  };

  const handlePredict = async () => {
    console.log(inputs);
    setIsLoading(true);
    try {
      // 先呼叫 timePredict，再呼叫 createTask
      const timeData = await timePredict(inputs);
      const taskData = await createTask(inputs);

      console.log(timeData);
      const assignScheduleData = await postAssignSchedule(
        taskData.task_id,
        timeData
      );
      const temp = [];
      temp.push(assignScheduleData.best_assignment);
      if (assignScheduleData.second_best_assignment) {
        temp.push(assignScheduleData.second_best_assignment);
      }
      console.log(temp);
      setTaskID(taskData.task_id);
      setChoice(temp);
      // 成功時開啟 dialog
      setIsDialogOpen(true);
    } catch (error) {
      console.error("API 發生錯誤", error.response.data.error);
      if (error.response.data.error === "land section/local points not found") {
        toast.error("找尋不到地段號和地號的組合，請檢查是否輸入正確");
      } else {
        toast.error(error.response.data.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 當 office 變更時，重置 landSectionQuery 與 inputs.landSection
  useEffect(() => {
    setLandSectionQuery("");
    setInputs((prev) => ({ ...prev, landSection: "" }));
  }, [inputs.office]);

  // 使用當前 office 選取對應的地段號選項
  const currentLandSectionOptions = getLandSectionOptions(inputs.office);
  // 過濾符合查詢的選項
  const filteredSuggestions = currentLandSectionOptions.filter(
    (option) =>
      option.name.includes(landSectionQuery) ||
      option.value.includes(landSectionQuery)
  );

  // 使用 ref 監聽點擊外部事件，關閉建議清單
  const landSectionRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        landSectionRef.current &&
        !landSectionRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [landSectionRef]);

  return (
    <div className="flex flex-col lg:flex-row h-screen ">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center space-y-10">
        <h2 className="text-2xl font-bold">鑑界排班時間預測</h2>
        <div className="grid grid-cols-4 gap-4 mt-4">
          {/* 事務所 */}
          <div>
            <label className="block text-sm font-bold mb-1">事務所</label>
            <select
              name="office"
              value={inputs.office}
              onChange={(e) => {
                handleInputChange(e);
                setShowSuggestions(false);
              }}
              className="border p-2 w-full"
            >
              {offices.map((office) => (
                <option key={office} value={office}>
                  {office}
                </option>
              ))}
            </select>
          </div>

          {/* 修改後的「地段號」輸入：支援打 key 或 value 搜尋 */}
          <div className="relative" ref={landSectionRef}>
            <label className="block text-sm font-bold mb-1">地段號</label>
            <input
              type="text"
              name="landSection"
              value={landSectionQuery}
              onChange={(e) => {
                setLandSectionQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="border p-2 w-full"
              placeholder="輸入地段名稱或數值"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <ul className="absolute z-10 left-0 right-0 bg-white border rounded-md mt-1">
                {filteredSuggestions.map((option, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() => {
                      setLandSectionQuery(option.value);
                      setInputs((prev) => ({
                        ...prev,
                        landSection: option.value,
                      }));
                      setShowSuggestions(false);
                    }}
                  >
                    {option.name}: {option.value}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 地號 */}
          <div>
            <label className="block text-sm font-bold mb-1">地號</label>
            <input
              type="text"
              name="localPoints"
              value={inputs.localPoint}
              onChange={(e) => {
                handleInputChange(e);
                setShowSuggestions(false);
              }}
              className="border p-2 w-full"
              placeholder="地號"
            />
          </div>

          {/* 測釘點數 */}
          <div>
            <label className="block text-sm font-bold mb-1">測釘點數</label>
            <input
              type="text"
              name="stakePoints"
              value={inputs.stakePoints}
              onChange={(e) => {
                handleInputChange(e);
                setShowSuggestions(false);
              }}
              className="border p-2 w-full"
              placeholder="測釘點數"
            />
          </div>

          {/* 作業面積 */}
          <div>
            <label className="block text-sm font-bold mb-1">作業面積</label>
            <input
              type="text"
              name="workArea"
              value={inputs.workArea}
              onChange={(e) => {
                handleInputChange(e);
                setShowSuggestions(false);
              }}
              className="border p-2 w-full"
              placeholder="作業面積"
            />
          </div>

          {/* 複丈時間 */}
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

          {/* 圖解區或數值區 */}
          <div>
            <label className="block text-sm font-bold mb-1">
              圖解區或數值區
            </label>
            <select
              name="diagramOrNumeric"
              value={inputs.diagramOrNumeric}
              onChange={(e) => {
                handleInputChange(e);
                setShowSuggestions(false);
              }}
              className="border p-2 w-full"
            >
              <option value="圖解區">圖解區</option>
              <option value="數值區">數值區</option>
            </select>
          </div>

          {/* 是否辦理地籍整理 */}
          <div>
            <label className="block text-sm font-bold mb-1">
              是否辦理地籍整理
            </label>
            <select
              name="cadastralArrangement"
              value={inputs.cadastralArrangement}
              onChange={(e) => {
                handleInputChange(e);
                setShowSuggestions(false);
              }}
              className="border p-2 w-full"
            >
              <option value="是">是</option>
              <option value="否">否</option>
            </select>
          </div>
        </div>

        <button
          onClick={handlePredict}
          className="text-white p-3 mt-4 bg-gray-700 hover:bg-gray-800 w-48 text-base flex items-center justify-center"
        >
          {isLoading ? (
            <div className="animate-spin h-5 w-5 border-4 border-white border-t-transparent rounded-full"></div>
          ) : (
            "預測"
          )}
        </button>
      </div>

      {/* Dialog（成功後） */}
      {isDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md w-3/5">
            <h3 className="text-xl font-semibold mb-4">選擇下一步</h3>
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
                    window.location.href = `/EmployeeCalandar?name=${encodeURIComponent(
                      item.assigned_employee
                    )}`;
                  }}
                >
                  <p className="text-sm text-gray-600">
                    案件地號：{inputs.localPoint}
                  </p>
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
                <div className="p-4 rounded-md border hover:bg-gray-100">
                  <h4 className="text-lg font-bold mb-2">自行彈性排班</h4>
                  <p className="text-sm text-gray-600">案件號碼：{taskID}</p>
                  <p className="text-sm text-gray-600">
                    所需工時：{choice[0].required_hours} 小時
                  </p>
                  <label className="block text-sm font-bold mt-2 mb-1">
                    選擇員工
                  </label>
                  <select
                    value={selectedEmployeeFlex}
                    onChange={(e) => setSelectedEmployeeFlex(e.target.value)}
                    className="border p-2 w-full"
                  >
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.name}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      window.location.href = `/EmployeeCalandar?name=${encodeURIComponent(
                        selectedEmployeeFlex
                      )}`;
                    }}
                    className="mt-2 text-white p-2 bg-gray-700 hover:bg-gray-800 w-full text-base"
                  >
                    確認
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default HomePage;
