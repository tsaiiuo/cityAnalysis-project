import React, { useState, useEffect, useRef, useContext } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createTask, timePredict } from "../api/tasksApi";
import { getEmployee } from "../api/employeeApi";
import { postAssignSchedule, autoSchedule } from "../api/scheduleApi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { OfficeContext } from "../officeContext";

// 根據 office 回傳對應的地段號選項
const getLandSectionOptions = (office) => {
  const mapping = {
    鹽水地政事務所: [
      { name: "橋南段", value: "2039" },
      { name: "路東段", value: "2040" },
      { name: "五軍營段", value: "2041" },
      { name: "太康段", value: "2042" },
      { name: "果毅後段", value: "2043" },
      { name: "新厝段", value: "2044" },
      { name: "大脚腿段", value: "2045" },
      { name: "小脚腿段", value: "2046" },
      { name: "山子脚段", value: "2047" },
      { name: "柳營段柳營小段", value: "2048" },
      { name: "柳營段溫厝廍小段", value: "2049" },
      { name: "八老爺段八老爺小段", value: "2050" },
      { name: "八老爺段半路店小段", value: "2051" },
      { name: "旭山段", value: "2057" },
      { name: "八翁段", value: "2058" },
      { name: "東昇段", value: "2063" },
      { name: "柳中段", value: "2064" },
      { name: "柳南段", value: "2065" },
      { name: "士林段", value: "2066" },
      { name: "人和段", value: "2073" },
      { name: "雙和段", value: "2080" },
      { name: "平和段", value: "2081" },
      { name: "新厝段北安小段", value: "2082" },
      { name: "大山段", value: "2083" },
      { name: "代天段", value: "2105" },
      { name: "義士段", value: "2121" },
      { name: "綠隧段", value: "2127" },
      { name: "重溪段", value: "2128" },
      { name: "篤農段", value: "2129" },
      { name: "德元段", value: "2132" },
      { name: "外環段", value: "2139" },
      { name: "東安段", value: "2148" },
      { name: "光福段", value: "2151" },
      { name: "新營段", value: "2001" },
      { name: "王公廟段", value: "2002" },
      { name: "茄苳脚段", value: "2003" },
      { name: "下角帶圍段", value: "2004" },
      { name: "許丑段", value: "2005" },
      { name: "埤寮段", value: "2006" },
      { name: "後鎮段", value: "2007" },
      { name: "土庫段", value: "2008" },
      { name: "卯舍段", value: "2009" },
      { name: "鐵線橋段", value: "2010" },
      { name: "姑爺段", value: "2012" },
      { name: "舊段", value: "2013" },
      { name: "太子宮段太子宮小段", value: "2014" },
      { name: "太子宮段埤子底小段", value: "2015" },
      { name: "太子宮段竹圍子小段", value: "2016" },
      { name: "嘉芳段", value: "2052" },
      { name: "茄苳段", value: "2054" },
      { name: "南紙段", value: "2055" },
      { name: "太子段", value: "2056" },
      { name: "新東段", value: "2079" },
      { name: "建國段", value: "2084" },
      { name: "長榮段", value: "2085" },
      { name: "三德段", value: "2086" },
      { name: "王公段", value: "2087" },
      { name: "新生段", value: "2088" },
      { name: "忠政段", value: "2089" },
      { name: "新泰段", value: "2091" },
      { name: "延平段", value: "2092" },
      { name: "濟安段", value: "2093" },
      { name: "真武段", value: "2094" },
      { name: "南興段", value: "2095" },
      { name: "復興段", value: "2096" },
      { name: "新富段", value: "2097" },
      { name: "新榮段", value: "2098" },
      { name: "華城段", value: "2099" },
      { name: "新電段", value: "2100" },
      { name: "新興段", value: "2101" },
      { name: "北紙段", value: "2102" },
      { name: "武賢段", value: "2103" },
      { name: "三民段", value: "2104" },
      { name: "大公段", value: "2106" },
      { name: "民生段", value: "2107" },
      { name: "東興段", value: "2108" },
      { name: "東學段", value: "2109" },
      { name: "大同段", value: "2110" },
      { name: "綠川段", value: "2111" },
      { name: "民族段", value: "2112" },
      { name: "三興段", value: "2113" },
      { name: "民權段", value: "2114" },
      { name: "永生段", value: "2115" },
      { name: "興安段", value: "2116" },
      { name: "興業段", value: "2117" },
      { name: "民治段", value: "2118" },
      { name: "南新段", value: "2119" },
      { name: "育德段", value: "2120" },
      { name: "土安段", value: "2122" },
      { name: "新民段", value: "2123" },
      { name: "新北段", value: "2124" },
      { name: "新橋段", value: "2125" },
      { name: "德隆段", value: "2126" },
      { name: "新卯舍段", value: "2133" },
      { name: "新秀才段", value: "2137" },
      { name: "長勝段", value: "2141" },
      { name: "新茄苳段", value: "2142" },
      { name: "新南段", value: "2144" },
      { name: "金華段", value: "2145" },
      { name: "周武段", value: "2146" },
      { name: "秦漢段", value: "2149" },
      { name: "東站段", value: "2150" },
      { name: "茄安段", value: "2152" },
      { name: "隋唐段", value: "2153" },
      { name: "鹽水段", value: "2017" },
      { name: "番子厝段", value: "2019" },
      { name: "田寮段", value: "2020" },
      { name: "飯店段", value: "2021" },
      { name: "南竹子脚段", value: "2022" },
      { name: "天保厝段", value: "2023" },
      { name: "坔頭港段", value: "2024" },
      { name: "菜公堂小段", value: "2026" },
      { name: "上帝廟小段", value: "2027" },
      { name: "溪洲寮段頂溪洲寮小段", value: "2028" },
      { name: "溪洲寮段下溪洲寮小段", value: "2029" },
      { name: "下中段下中小段", value: "2033" },
      { name: "下中段牛稠子小段", value: "2034" },
      { name: "舊營段舊營小段", value: "2035" },
      { name: "舊營段後寮小段", value: "2036" },
      { name: "孫厝寮段孫厝寮小段", value: "2037" },
      { name: "孫厝寮段番子寮小段", value: "2038" },
      { name: "竹圍尾段", value: "2053" },
      { name: "下林段", value: "2059" },
      { name: "大埔段", value: "2060" },
      { name: "岸南段", value: "2061" },
      { name: "忠義段", value: "2062" },
      { name: "水秀段", value: "2067" },
      { name: "北門段", value: "2068" },
      { name: "朝琴段", value: "2069" },
      { name: "新岸段", value: "2070" },
      { name: "武廟段", value: "2071" },
      { name: "義稠段", value: "2072" },
      { name: "月港段", value: "2074" },
      { name: "月津段", value: "2075" },
      { name: "後厝段", value: "2076" },
      { name: "南門段", value: "2077" },
      { name: "仁愛段", value: "2078" },
      { name: "南港段", value: "2130" },
      { name: "歡雅段", value: "2131" },
      { name: "仁光段", value: "2134" },
      { name: "竹子腳段", value: "2135" },
      { name: "新坔頭港段", value: "2136" },
      { name: "汫水段", value: "2138" },
      { name: "孫厝段", value: "2140" },
      { name: "義中段", value: "2143" },
      { name: "三和段", value: "2147" },
      { name: "田都段", value: "2154" },
      { name: "田厝段", value: "2155" },
      { name: "忠孝段", value: "2156" },
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
  const { office } = useContext(OfficeContext);

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
  // useEffect(() => {
  //   const searchParams = new URLSearchParams(location.search);
  //   const officeParam = searchParams.get("office");
  //   // if (officeParam) {
  //   //   setInputs((prev) => ({ ...prev, office: officeParam }));
  //   // }
  // }, [location.search]);

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
    if (office) {
      setInputs((prev) => ({ ...prev, office: office }));
    }
    console.log(office);
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
            <input
              type="text"
              name="office"
              value={inputs.office.name}
              className="border p-2 w-full"
              placeholder="事務所"
            />
          </div>

          {/* 修改後的「地段號」輸入：支援打 key 或 value 搜尋 */}
          <div className="relative" ref={landSectionRef}>
            <label className="block text-sm font-bold mb-1">地段號</label>
            <input
              type="text"
              name="landSection"
              value={landSectionQuery}
              onChange={(e) => {
                const newValue = e.target.value;
                setLandSectionQuery(newValue);
                setInputs((prev) => ({ ...prev, landSection: newValue }));
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="border p-2 w-full"
              placeholder="輸入地段名稱或數值"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <ul className="absolute z-10 left-0 right-0 bg-white border rounded-md mt-1 h-screen overflow-y-auto">
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
                  onClick={
                    item.required_hours === "無法判別地號"
                      ? undefined
                      : () => {
                          console.log(convertToUTC(item.start_time));
                          autoSchedule(
                            convertToUTC(item.start_time),
                            convertToUTC(item.end_time),
                            taskID,
                            item.assigned_employee
                          );
                          console.log(`選擇 ${item.assigned_employee}`);
                          setIsDialogOpen(false);
                          window.location.href = `/EmployeeClandar?name=${encodeURIComponent(
                            item.assigned_employee
                          )}&taskID=${encodeURIComponent(taskID)}`;
                        }
                  }
                >
                  {item.required_hours === "無法判別地號" ? (
                    <div>
                      {" "}
                      <p className="text-sm text-gray-600">
                        案件地號：{inputs.localPoint}
                      </p>
                      <h4 className="text-lg font-bold mb-2">
                        無法判別地號，請自行排班
                      </h4>
                    </div>
                  ) : (
                    <div>
                      {" "}
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
                  )}
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
                      window.location.href = `/EmployeeClandar?name=${encodeURIComponent(
                        selectedEmployeeFlex
                      )}&taskID=${encodeURIComponent(taskID)}`;
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
