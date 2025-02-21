import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
  Calendar as BigCalendar,
  momentLocalizer,
  Views,
} from "react-big-calendar";
import DatePicker from "react-datepicker";

import axios from "axios";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import EventComponent from "../components/EventComponent";
import LitleComponent from "../components/LittleComponent";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { deleteSchedule, getSchedule } from "../api/scheduleApi";
import { getEmployee } from "../api/employeeApi";

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
    console.log(startDate.toDateString());
    console.log(endDate.toDateString());
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
    console.log("end");
    result.push({
      start: lastDayStart,
      end: endDate,
      ...rest,
    });
  }

  return result;
};

const OverallCalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [value, onChange] = useState(new Date());
  const [view, setView] = useState(Views.WORK_WEEK);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [employeeColors, setEmployeeColors] = useState({});
  const [employees, setEmployees] = useState([]);
  const [activeStartDate, setActiveStartDate] = useState(new Date());

  // 新增：用於查詢地段號的輸入值及查詢結果
  const [localPointSearch, setLocalPointSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [taskEndDate, setTaskEndDate] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schedule, employee] = await Promise.all([
          getSchedule(),
          getEmployee(),
        ]);

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
        setEmployeeColors(mapping);
        setEmployees(employee);
        setEvents(convertedData);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData(); // 呼叫 API
  }, []);

  // 當 localPointSearch 或 events 改變時，根據 local_point 進行搜尋
  useEffect(() => {
    if (localPointSearch.trim() === "") {
      setSearchResults([]);
    } else {
      const results = events.filter((event) => {
        const landSectionStr = event.land_section
          ? String(event.land_section)
          : "";
        const localPointStr = event.local_point ? event.local_point : "";
        // 將兩個欄位合併，並轉成小寫比對
        const combined = (landSectionStr + localPointStr).toLowerCase();
        return combined.includes(localPointSearch.toLowerCase());
      });
      // 根據事件開始時間排序，較晚的 (日期較遠) 排在最前面
      results.sort((a, b) => new Date(b.start) - new Date(a.start));
      setSearchResults(results);
    }
  }, [localPointSearch, events]);

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
  const handleDateChange = (date) => {
    setTaskEndDate(date);
    console.log(taskEndDate);
  };
  const handleActiveStartDateChange = ({
    activeStartDate: newActiveStartDate,
    view,
  }) => {
    if (view === "month") {
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

  const handleEventDialogOpen = (event) => {
    setSelectedEvent(event);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    console.log("刪除事件資料：", selectedEvent);
    await deleteSchedule(selectedEvent);
    const schedule = await getSchedule();
    let temp = [];
    for (let i = 0; i < schedule.length; i++) {
      const re = splitDateRange(schedule[i]);
      for (let j = 0; j < re.length; j++) {
        temp.push(re[j]);
      }
    }
    const convertedData = temp.map((item) => ({
      ...item,
      start: new Date(item.start),
      end: new Date(item.end),
    }));
    setEvents(convertedData);
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

        console.log("Task completed:", data);
        alert("任務已順利完成!");
      }
    } catch (error) {
      console.error("Error completing task:", error);
      alert("Error completing task: " + error.message);
    }
    handleCloseDialog();
  };

  const eventPropGetter = (event, start, end, isSelected) => {
    let backgroundColor = "";
    if (event.is_scheduled === 1) {
      backgroundColor = "#ff4d4d";
    } else {
      backgroundColor = employeeColors[event.name] || "#d1d5db";
    }
    return {
      style: {
        backgroundColor,
        border: "none",
        color: "#333",
      },
    };
  };

  return (
    <div className="flex flex-row h-screen overflow-y-auto">
      <Sidebar />
      {/* 主內容區分成兩欄：左側為 Calendar 區，右側為查詢區 */}
      <div className="flex flex-row w-full">
        {/* 左側 Calendar 區 */}
        <div className="w-3/4">
          <div className="h-full bg-white p-4 rounded-md">
            <div className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-bold mb-4">
                現在選擇日期：
                {currentDate.toLocaleDateString("zh-TW", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
              <button
                onClick={() => setIsCalendarVisible(!isCalendarVisible)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-blue-600"
              >
                {isCalendarVisible ? "收起 Calendar" : "顯示 Calendar"}
              </button>
            </div>
            {isCalendarVisible && (
              <Calendar
                onChange={(newDate) => setCurrentDate(newDate)}
                value={currentDate}
                onActiveStartDateChange={handleActiveStartDateChange}
                className="mb-8"
              />
            )}
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "98%" }}
              min={new Date(2025, 1, 0, 8, 0, 0)}
              max={new Date(2025, 1, 0, 17, 0, 0)}
              selectable
              views={[Views.WORK_WEEK, Views.DAY]}
              onView={handleOnChangeView}
              view={view}
              components={{
                event: EventComponent,
              }}
              eventPropGetter={eventPropGetter}
              onSelectEvent={handleEventDialogOpen}
              onNavigate={handleActiveStartDateChange}
              date={currentDate}
            />
          </div>
        </div>

        {/* 右側查詢區 */}
        <div className="w-1/4 h-screen overflow-y-auto bg-white p-6 shadow-lg rounded-lg">
          <div className="flex flex-col space-y-6">
            <input
              type="text"
              placeholder="查詢地段號/地號"
              value={localPointSearch}
              onChange={(e) => setLocalPointSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">查詢結果</h3>
              {searchResults.length > 0 ? (
                searchResults.map((event, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow duration-300 mb-4 text-[12px] ${
                      event.is_scheduled === 1
                        ? "bg-red-500 text-white"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    <p className="mb-2">
                      <span
                        className={`font-semibold ${
                          event.is_scheduled === 1
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {event.is_scheduled === 0
                          ? "任務尚未完成"
                          : "任務已完成"}
                      </span>
                    </p>
                    <p className="mb-2">
                      <span
                        className={`font-semibold ${
                          event.is_scheduled === 1
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        時間：
                      </span>
                      {formatDateToTaiwanTime(event.start)} ~{" "}
                      {formatDateToTaiwanTime(event.end)}
                    </p>
                    <p className="mb-2">
                      <span
                        className={`font-semibold ${
                          event.is_scheduled === 1
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        地段：
                      </span>
                      {event.land_section}
                    </p>
                    <p className="mb-2">
                      <span
                        className={`font-semibold ${
                          event.is_scheduled === 1
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        地段號：
                      </span>
                      {event.local_point}
                    </p>
                    <p>
                      <span
                        className={`font-semibold ${
                          event.is_scheduled === 1
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        人員：
                      </span>
                      {event.name}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">查無符合資料</p>
              )}
            </div>
          </div>
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

export default OverallCalendarPage;
