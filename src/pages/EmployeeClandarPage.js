import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
  Calendar as BigCalendar,
  momentLocalizer,
  Views,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Calendar from "react-calendar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import "react-calendar/dist/Calendar.css";
import "../Employee.css";
import EventComponent from "../components/EventComponent";
import {
  deleteSchedule,
  getSchedule,
  createSchedule,
} from "../api/scheduleApi";
import { getEmployee } from "../api/employeeApi";
import { getTasks } from "../api/tasksApi";

const localizer = momentLocalizer(moment);

// Helper: 將 ISO 時間轉換成台灣時區格式
const formatDateToTaiwanTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
};

const splitDateRange = (item) => {
  const { start, end, ...rest } = item; // 分解 start 和 end，保留其他屬性
  const result = [];
  const startDate = new Date(start);
  const endDate = new Date(end);
  console.log(startDate);
  console.log(endDate);

  // 如果 start 和 end 是同一天，直接返回一個 object
  if (startDate.toDateString() === endDate.toDateString()) {
    result.push({ start: startDate, end: endDate, ...rest });
    return result;
  }

  // 第一天：從 start 到當天 17:00
  const firstDayEnd = new Date(startDate);
  firstDayEnd.setHours(17, 0, 0, 0);
  if (startDate < firstDayEnd) {
    result.push({
      start: startDate,
      end: firstDayEnd,
      ...rest,
    });
  }

  // 中間天數：從 08:00 到 17:00
  let currentStart = new Date(startDate);
  currentStart.setDate(currentStart.getDate() + 1);
  currentStart.setHours(8, 0, 0, 0);

  while (currentStart.toDateString() !== endDate.toDateString()) {
    const currentEnd = new Date(currentStart);
    currentEnd.setHours(17, 0, 0, 0);
    result.push({
      start: currentStart,
      end: currentEnd,
      ...rest,
    });

    currentStart = new Date(currentEnd);
    currentStart.setDate(currentStart.getDate() + 1);
    currentStart.setHours(8, 0, 0, 0);
  }

  // 最後一天：從 08:00 到 end
  const lastDayStart = new Date(endDate);
  lastDayStart.setHours(8, 0, 0, 0);
  if (endDate > lastDayStart) {
    result.push({
      start: lastDayStart,
      end: endDate,
      ...rest,
    });
  }

  return result;
};

const EmployeeCalendarPage = () => {
  const [view, setView] = useState(Views.WORK_WEEK);
  const [selectedTask, setSelectedTask] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [taskEndDate, setTaskEndDate] = useState("");
  // 新增：用來控制 dialog 的顯示與記錄被選取的事件
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [employeeColors, setEmployeeColors] = useState({});
  const [employees, setEmployees] = useState([]);
  const [activeStartDate, setActiveStartDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasks, schedule, employee] = await Promise.all([
          getTasks(),
          getSchedule(),
          getEmployee(),
        ]);
        console.log(employee);
        let temp = [];
        for (let i = 0; i < schedule.length; i++) {
          const re = splitDateRange(schedule[i]);
          for (let j = 0; j < re.length; j++) {
            temp.push(re[j]);
          }
        }

        const convertedData = temp.map((item) => ({
          ...item, // 保留原始屬性
          start: new Date(item.start), // 將 start 轉為 Date
          end: new Date(item.end), // 將 end 轉為 Date
        }));
        setEvents(convertedData);

        // 取得 URL 參數中的 name
        const params = new URLSearchParams(window.location.search);
        const queryName = params.get("name");

        let filtered;
        if (queryName) {
          // 若有參數則以參數作為過濾條件及預設選擇
          filtered = convertedData
            .filter((event) => event.name === queryName)
            .sort((a, b) => a.start - b.start);
          setFilteredEvents(filtered);
          setSelectedName(queryName);
        } else {
          // 若無則保持原先邏輯
          filtered = convertedData
            .filter((event) => event.name === schedule[0].name)
            .sort((a, b) => a.start - b.start);
          setFilteredEvents(filtered);
          setSelectedName(convertedData[0].name);
        }

        const palette = [
          "#e2f8ff",
          "#fefce8",
          "#f2f1ff",
          "#fdf2fb",
          "#fde2e2",
          "#e2fde2",
          "#e2e2fd",
          "#fde2fd",
          "#d2e2fd",
          "#fce2d2",
        ];

        // 建立 mapping：依照回傳順序為前 10 個員工指定顏色
        const mapping = {};
        employee.forEach((e, index) => {
          if (index < palette.length) {
            mapping[e.name] = palette[index];
          }
        });
        console.log(filtered);
        setEmployeeColors(mapping);
        setEmployees(employee);
        setTasks(tasks); // 更新 tasks 狀態

        // 取得 URL 參數中的 taskID，若有則以該 taskID 作為預設選擇，否則使用 tasks[0].task_id
        const taskIDParam = params.get("taskID");
        if (taskIDParam) {
          setSelectedTask(taskIDParam);
        } else if (tasks && tasks.length > 0) {
          setSelectedTask(tasks[0].task_id);
        }
        console.log("Selected Task:", taskIDParam || tasks[0].task_id);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData(); // 呼叫 API
  }, []);
  const handleDateChange = (date) => {
    setTaskEndDate(date);
    console.log(taskEndDate);
  };
  // Helper：根據當前選取日期的「日」數，計算在目標月份中的日期
  const getSameDayInMonth = (date, targetMonthDate) => {
    const day = date.getDate();
    const year = targetMonthDate.getFullYear();
    const month = targetMonthDate.getMonth();
    // 計算目標月份總天數
    const daysInTargetMonth = new Date(year, month + 1, 0).getDate();
    // 若當前日期超過目標月份最大天數，則使用目標月份最後一天
    const newDay = day > daysInTargetMonth ? daysInTargetMonth : day;
    return new Date(year, month, newDay);
  };
  const handleActiveStartDateChange = ({
    activeStartDate: newActiveStartDate,
    view,
  }) => {
    // 僅處理月視圖
    if (view === "month") {
      // 若原先的 activeStartDate 不存在或月份發生改變，則更新 currentDate
      if (
        !activeStartDate ||
        activeStartDate.getMonth() !== newActiveStartDate.getMonth()
      ) {
        const newDate = getSameDayInMonth(currentDate, newActiveStartDate);
        setCurrentDate(newDate);
      }
      setActiveStartDate(newActiveStartDate);
    }
  };

  const handleOnChangeView = (selectedView) => {
    setView(selectedView);
  };

  const handleSelectSlot = async ({ start, end }) => {
    const isConfirmed = window.confirm(
      `規劃以下時間：\n\n員工: ${selectedName}\n開始: ${start}\n結束: ${end}\n\n按「確定」送出需求，按「取消」關閉`
    );

    if (isConfirmed) {
      console.log(`已規劃時間: 員工 ${selectedName} (${start} - ${end})`);
      // 送出需求（例如發送 API 請求）
      await createSchedule(start, end, selectedTask, selectedName);
      const schedule = await getSchedule();
      let temp = [];
      for (let i = 0; i < schedule.length; i++) {
        const re = splitDateRange(schedule[i]);
        temp.push(...re);
      }

      console.log(temp);
      const convertedData = temp.map((item) => ({
        ...item,
        start: new Date(item.start),
        end: new Date(item.end),
      }));
      setEvents(convertedData);
      const filtered = convertedData
        .filter((event) => event.name === selectedName)
        .sort((a, b) => a.start - b.start);
      console.log(filtered);
      setFilteredEvents(filtered);
    } else {
      console.log(`已取消規劃時間: 員工 ${selectedName}`);
    }
  };

  const handleNameChange = async (e) => {
    setSelectedName(e.target.value);

    var filtered = events
      .filter((event) => event.name === e.target.value)
      .sort((a, b) => a.start - b.start);
    console.log(filtered);
    setFilteredEvents(filtered);
  };

  const handleSelectTaskChange = (e) => {
    setSelectedTask(e.target.value);
  };

  // 當使用者點選事件時，打開 dialog 並記錄被選取的事件
  const handleEventDialogOpen = (event) => {
    setSelectedEvent(event);
    setShowDialog(true);
  };

  // 關閉 dialog
  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedEvent(null);
  };

  // 刪除事件的處理，原先的 handleSelectEvent 刪除邏輯搬移至此
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    console.log("刪除事件資料：", selectedEvent);

    await deleteSchedule(selectedEvent);
    const schedule = await getSchedule();
    var temp = [];
    for (var i = 0; i < schedule.length; i++) {
      var re = splitDateRange(schedule[i]);
      for (var j = 0; j < re.length; j++) {
        temp.push(re[j]);
      }
    }

    const convertedData = temp.map((item) => ({
      ...item,
      start: new Date(item.start),
      end: new Date(item.end),
    }));
    setEvents(convertedData);
    var filtered = convertedData
      .filter((event) => event.name === selectedName)
      .sort((a, b) => a.start - b.start);
    console.log(filtered);
    setFilteredEvents(filtered);
    // 完成刪除後關閉 dialog
    handleCloseDialog();
  };

  const handleCompleteEvent = async () => {
    if (!selectedEvent) return;
    if (taskEndDate === "") {
      alert("請選擇完成時間");
      return;
    }
    console.log("Complete event: ", selectedEvent);
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/tasks/complete/${selectedEvent.task_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          // 將 taskEndDate 當作 current_time 傳遞給後端
          body: JSON.stringify({
            current_time: taskEndDate,
          }),
        }
      );
      if (!response.ok) {
        alert("Failed to complete task");
        console.error("Failed to complete task");
      } else {
        const data = await response.json();
        const schedule = await getSchedule();
        var temp = [];
        for (var i = 0; i < schedule.length; i++) {
          var re = splitDateRange(schedule[i]);
          for (var j = 0; j < re.length; j++) {
            temp.push(re[j]);
          }
        }

        const convertedData = temp.map((item) => ({
          ...item,
          start: new Date(item.start),
          end: new Date(item.end),
        }));
        setEvents(convertedData);
        var filtered = convertedData
          .filter((event) => event.name === selectedName)
          .sort((a, b) => a.start - b.start);
        console.log(filtered);
        setFilteredEvents(filtered);
        console.log("Task completed:", data);
        alert("任務已順利完成!");
      }
    } catch (error) {
      console.error("Error completing task:", error);
      alert("Error completing task: " + error.message);
    }
    handleCloseDialog();
  };
  // BigCalendar 的 eventPropGetter 利用 mapping 指定顏色
  const eventPropGetter = (event, start, end, isSelected) => {
    // 根據 event.name 取得對應的顏色，若 mapping 中沒有則使用預設顏色
    var backgroundColor = "";
    if (event.is_scheduled === 1) {
      backgroundColor = "#ff4d4d";
    } else {
      backgroundColor = employeeColors[event.name] || "#d1d5db";
    }
    return {
      style: {
        backgroundColor,
        border: "none", // 移除預設邊框
        color: "#333",
      },
    };
  };

  return (
    <div className="flex flex-row h-screen">
      <Sidebar />

      <div className="w-2/3 overflow-y-auto">
        <div className="h-full bg-white p-4 rounded-md">
          <div className="flex flex-row items-center justify-between">
            <div className="text-2xl font-bold p-2">員工排班系統</div>
            <div className="">
              <label
                htmlFor="nameFilter"
                className="mr-2 font-semibold text-base p-2"
              >
                選擇已預測地號:
              </label>
              <select
                id="nameFilter"
                value={selectedTask}
                onChange={handleSelectTaskChange}
                className="border p-1 text-[12px]"
              >
                {[
                  ...new Map(
                    tasks.map((task) => [task.task_id, task])
                  ).values(),
                ].map((task) => (
                  <option key={task.task_id} value={task.task_id}>
                    地段:{task.land_section}地號:{task.local_point}
                  </option>
                ))}
              </select>
            </div>
            <div className="">
              <label
                htmlFor="nameFilter"
                className="mr-2 font-semibold text-base p-2"
              >
                選擇員工:
              </label>
              <select
                id="nameFilter"
                value={selectedName}
                onChange={handleNameChange}
                className="border p-1 text-[12px]"
              >
                {employees.map((employee) => (
                  <option key={employee.name} value={employee.name}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <BigCalendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "98%" }}
            min={new Date(2025, 1, 0, 8, 0, 0)}
            max={new Date(2025, 1, 0, 17, 0, 0)}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleEventDialogOpen} // 點選事件時開啟 dialog
            views={[Views.WORK_WEEK, Views.DAY]}
            onView={handleOnChangeView}
            view={view}
            eventPropGetter={eventPropGetter}
            components={{
              event: EventComponent,
            }}
            onNavigate={handleActiveStartDateChange}
            date={currentDate}
          />
        </div>
      </div>

      <div className="w-1/3">
        <div className="flex-1 bg-white p-6 rounded-md max-w-4xl mx-auto mt-10">
          <Calendar
            onChange={(newDate) => setCurrentDate(newDate)}
            value={currentDate}
            onActiveStartDateChange={handleActiveStartDateChange}
            className="mb-8"
          />
        </div>
      </div>

      {/* Dialog Modal */}
      {showDialog && selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative bg-white p-6 rounded-md shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">操作選擇</h3>
            {/* 顯示與 formattedText 相同的案件詳細資訊 */}
            <pre className="bg-gray-100 p-2 rounded-md mb-4 whitespace-pre-wrap text-sm">
              {`案件編號：${selectedEvent.task_id}
工作人員: ${selectedEvent.name}
地段號: ${selectedEvent.local_point}
界釘數: ${selectedEvent.stake_point}
丈量面積: ${selectedEvent.work_area}
複丈時間:
${formatDateToTaiwanTime(selectedEvent.check_time)}`}
            </pre>
            <p className="mb-4">
              請選擇要對任務編號 {selectedEvent.task_id} 進行的操作
            </p>
            <div className="flex justify-start space-x-2">
              <button
                onClick={handleDeleteEvent}
                className="bg-red-500 text-white px-3 py-2 rounded-md"
              >
                刪除此次排班
              </button>
            </div>
            <div className="flex justify-start space-x-2 mt-1">
              <button
                onClick={handleCompleteEvent}
                className="bg-green-500 text-white px-3 py-2 rounded-md"
              >
                完結任務時間
              </button>
              <div>
                <DatePicker
                  selected={taskEndDate}
                  onChange={handleDateChange}
                  showTimeSelect
                  dateFormat="Pp"
                  className="border p-2 w-full"
                  placeholderText="選擇完成任務時間"
                />
              </div>
            </div>
            <button
              onClick={handleCloseDialog}
              className="absolute top-2 right-2 text-gray-500"
            >
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeCalendarPage;
