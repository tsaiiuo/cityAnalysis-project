import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
  Calendar as BigCalendar,
  momentLocalizer,
  Views,
} from "react-big-calendar";
import axios from "axios";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import EventComponent from "../components/EventComponent";
import LitleComponent from "../components/LittleComponent";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../Little.css";
import { deleteSchedule, getSchedule } from "../api/scheduleApi";

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

  // 新增：控制 dialog 顯示與記錄被選取的事件
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const schedule = await getSchedule();
        var temp = [];
        for (var i = 0; i < schedule.length; i++) {
          var re = splitDateRange(schedule[i]);
          for (var j = 0; j < re.length; j++) {
            temp.push(re[j]);
          }
        }

        const convertedData = temp.map((item) => ({
          ...item, // 保留原始屬性
          start: new Date(item.start), // 將 start 轉為 Date
          end: new Date(item.end), // 將 end 轉為 Date
        }));

        setEvents(convertedData);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData(); // 呼叫 API
  }, []); // 空依賴陣列確保只執行一次

  const handleNavigate = (date) => {
    setCurrentDate(date); // 更新当前选中的日期
    console.log("Current selected date:", date);
  };

  const handleOnChangeView = (selectedView) => {
    setView(selectedView);
  };

  // 修改：當使用者點選事件時，開啟 dialog
  const handleEventDialogOpen = (event) => {
    setSelectedEvent(event);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedEvent(null);
  };

  // 修改：刪除事件的處理
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
    handleCloseDialog();
  };

  // 修改：完結事件的處理（呼叫後端 API 將 task 的 is_scheduled 設成 0）
  const handleCompleteEvent = async () => {
    if (!selectedEvent) return;
    console.log("Complete event: ", selectedEvent);
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/tasks/complete/${selectedEvent.task_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
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

  return (
    <div className="flex flex-row h-screen overflow-y-auto">
      <Sidebar />

      <div className="w-full">
        <div className="h-full bg-white p-4 rounded-md">
          <div className="flex flex-row justify-between">
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
              onChange={(newDate) => {
                setCurrentDate(newDate);
              }}
              value={currentDate}
              className="mb-8 w-full"
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
              event: LitleComponent,
            }}
            onSelectEvent={handleEventDialogOpen} // 改為開啟 dialog
            onNavigate={handleNavigate}
            date={currentDate}
          />
        </div>
      </div>

      {/* Dialog Modal */}
      {showDialog && selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative bg-white p-6 rounded-md shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">操作選擇</h3>
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
              請選擇對任務編號 {selectedEvent.task_id} 的操作
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDeleteEvent}
                className="bg-red-500 text-white px-3 py-2 rounded-md"
              >
                刪除此次排班編號：{selectedEvent.schedule_id}
              </button>
              <button
                onClick={handleCompleteEvent}
                className="bg-green-500 text-white px-3 py-2 rounded-md"
              >
                完結整項任務
              </button>
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
