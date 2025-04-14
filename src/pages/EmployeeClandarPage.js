import React, { useState, useEffect, useContext } from "react";
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
import { updateTask } from "../api/tasksApi";
import {
  addLeaveRecord,
  deleteLeaveRecord,
  getLeaveRecords,
} from "../api/leaveApi"; // 請假 API

import {
  addDivideRecord,
  deleteDivideRecord,
  getDivideRecords,
} from "../api/divideApi"; // 請假 API

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getEmployee } from "../api/employeeApi";
import { getTasks, completeTask } from "../api/tasksApi";
import { OfficeContext } from "../officeContext";

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
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("病假");
  const [leaveReason, setLeaveReason] = useState("");
  //分割
  const [isDivideDilogOpen, setIsDivideDialogOpen] = useState(false);
  const [locationNum, setDivideLocation] = useState("");
  const [landNum, setDivideLandNum] = useState("");

  const [newScheduleStart, setNewScheduleStart] = useState(null);
  const [newScheduleEnd, setNewScheduleEnd] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  // 初始化更新欄位：以 selectedEvent 為初始值
  const [updatedStakePoint, setUpdatedStakePoint] = useState("");
  const [updatedLocalPoint, setUpdatedLocalPoint] = useState("");
  const [updatedWorkArea, setUpdatedWorkArea] = useState("");
  const [updatedCheckTime, setUpdatedCheckTime] = useState("");
  const { office } = useContext(OfficeContext);

  const refreshCalender = async () => {
    const [schedule, leaves, divide] = await Promise.all([
      getSchedule(office.office_id),
      getLeaveRecords(office.office_id),
      getDivideRecords(office.office_id),
    ]);

    let temp = [];
    for (let i = 0; i < schedule.length; i++) {
      const re = splitDateRange(schedule[i]);
      for (let j = 0; j < re.length; j++) {
        temp.push(re[j]);
      }
    }
    for (let i = 0; i < leaves.length; i++) {
      const re = splitDateRange(leaves[i]);
      for (let j = 0; j < re.length; j++) {
        temp.push(re[j]);
      }
    }
    for (let i = 0; i < divide.length; i++) {
      const re = splitDateRange(divide[i]);
      for (let j = 0; j < re.length; j++) {
        temp.push(re[j]);
      }
    }
    console.log(temp);
    const convertedData = temp.map((item) => ({
      ...item, // 保留原始屬性
      start: new Date(item.start), // 將 start 轉為 Date
      end: new Date(item.end), // 將 end 轉為 Date
    }));
    setEvents(convertedData);
    const filtered = convertedData
      .filter((event) => event.name === selectedName)
      .sort((a, b) => a.start - b.start);
    setFilteredEvents(filtered);
  };
  
  // 當使用者點擊「更新」按鈕時，傳回更新後的資料

  {/*const handleUpdate = async () => {
    const updatedData = {
      stake_point: updatedStakePoint,
      local_point: updatedLocalPoint,
      work_area: updatedWorkArea,
      check_time: updatedCheckTime,
    };
  
    try {
      // 1. 更新任務資料
      await updateTask(selectedEvent.task_id, updatedData);
      const tasks = await getTasks(false, office.office_id);
      setTasks(tasks);
      setSelectedEvent((prevEvent) => ({
        ...prevEvent,
        ...updatedData,
      }));
  
      // 2. 如有新排班時間，先刪除再新增
      if (newScheduleStart && newScheduleEnd) {
        let deleteSuccess = false;
        let createSuccess = false;
  
        // a. 嘗試刪除（先刪舊排班）
        if (selectedEvent) {
          try {
            await deleteSchedule(selectedEvent); // 🔇 靜音
            deleteSuccess = true;
          } catch (err) {
            toast.error("刪除舊排班失敗");
          }
        }
  
        // b. 刪除成功才嘗試新增
        if (deleteSuccess) {
          try {
            await createSchedule(
              newScheduleStart,
              newScheduleEnd,
              selectedTask,
              selectedName
            );
            createSuccess = true;
          } catch (err) {
            toast.error("新增排班失敗");
          }
        }
  
        // c. 兩者都成功才算成功
        {/*if (deleteSuccess && createSuccess) {
          toast.success("排班更新成功");
          setNewScheduleStart(null);
          setNewScheduleEnd(null);
        }
        if (deleteSuccess && createSuccess) {
          toast.success("排班更新成功");
        
          // ✅ 更新 selectedEvent 的 start / end 時間，讓下一次可以正確刪除
          setSelectedEvent((prev) => ({
            ...prev,
            start: newScheduleStart,
            end: newScheduleEnd,
          }));
        
          setNewScheduleStart(null);
          setNewScheduleEnd(null);
        }
      }
  
      // 3. 更新日曆
      await refreshCalender();
    } catch (err) {
      toast.error(err?.response?.data?.error || "操作失敗，請稍後再試");
    }
  
    setIsEditing(false);
  };*/}
  
  const handleUpdate = async () => {
    const updatedData = {
      stake_point: updatedStakePoint,
      local_point: updatedLocalPoint,
      work_area: updatedWorkArea,
      check_time: updatedCheckTime,
    };
  
    try {
      // ✅ 先記下原本的排班時間
      const prevSchedule = {
        ...selectedEvent,
        start: selectedEvent.start,
        end: selectedEvent.end,
      };
  
      // 1. 更新任務資料
      await updateTask(selectedEvent.task_id, updatedData);
      const tasks = await getTasks(false, office.office_id);
      setTasks(tasks);
      setSelectedEvent((prevEvent) => ({
        ...prevEvent,
        ...updatedData,
      }));
  
      // 2. 如有新排班時間，先刪除再新增
      if (newScheduleStart && newScheduleEnd) {
        let deleteSuccess = false;
        let createSuccess = false;
  
        // a. 刪除舊排班 → 改成用 prevSchedule
        try {
          await deleteSchedule(prevSchedule, false); // 🔇 靜音
          deleteSuccess = true;
        } catch (err) {
          toast.error("刪除舊排班失敗");
        }
  
        // b. 刪除成功才新增
        if (deleteSuccess) {
          try {
            await createSchedule(
              newScheduleStart,
              newScheduleEnd,
              selectedTask,
              selectedName
            );
            createSuccess = true;
          } catch (err) {
            toast.error("新增排班失敗");
          }
        }
  
        // c. 兩者成功才視為更新成功
        if (deleteSuccess && createSuccess) {
          toast.success("排班更新成功");
  
          // 更新畫面狀態
          setSelectedEvent((prev) => ({
            ...prev,
            start: newScheduleStart,
            end: newScheduleEnd,
          }));
  
          setNewScheduleStart(null);
          setNewScheduleEnd(null);
        }
      }
  
      // 3. 更新日曆
      await refreshCalender();
    } catch (err) {
      toast.error(err?.response?.data?.error || "操作失敗，請稍後再試");
    }
  
    setIsEditing(false);
  };
  
  
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasks, schedule, employee, leaves, divide] = await Promise.all([
          getTasks(false, office.office_id),
          getSchedule(office.office_id),
          getEmployee(office.office_id),
          getLeaveRecords(office.office_id),
          getDivideRecords(office.office_id),
        ]);
        setTasks(tasks); // 更新 tasks 狀態
        console.log(schedule);
        let temp = [];
        for (let i = 0; i < schedule.length; i++) {
          const re = splitDateRange(schedule[i]);
          for (let j = 0; j < re.length; j++) {
            temp.push(re[j]);
          }
        }
        for (let i = 0; i < leaves.length; i++) {
          const re = splitDateRange(leaves[i]);
          for (let j = 0; j < re.length; j++) {
            temp.push(re[j]);
          }
        }
        for (let i = 0; i < divide.length; i++) {
          const re = splitDateRange(divide[i]);
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
          if (convertedData[0]) {
            setSelectedName(convertedData[0].name);
          } else {
            setSelectedName(employee[0]);
          }
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
        setEmployeeColors(mapping);
        setEmployees(employee);

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

  // const handleSelectSlot = async ({ start, end }) => {
  //   const isConfirmed = window.confirm(
  //     `規劃以下時間：\n\n員工: ${selectedName}\n開始: ${start}\n結束: ${end}\n\n按「確定」送出需求，按「取消」關閉`
  //   );

  //   if (isConfirmed) {
  //     console.log(`已規劃時間: 員工 ${selectedName} (${start} - ${end})`);
  //     // 送出需求（例如發送 API 請求）
  //     await createSchedule(start, end, selectedTask, selectedName);
  //     const schedule = await getSchedule();
  //     let temp = [];
  //     for (let i = 0; i < schedule.length; i++) {
  //       const re = splitDateRange(schedule[i]);
  //       temp.push(...re);
  //     }

  //     console.log(temp);
  //     const convertedData = temp.map((item) => ({
  //       ...item,
  //       start: new Date(item.start),
  //       end: new Date(item.end),
  //     }));
  //     setEvents(convertedData);
  //     const filtered = convertedData
  //       .filter((event) => event.name === selectedName)
  //       .sort((a, b) => a.start - b.start);
  //     console.log(filtered);
  //     setFilteredEvents(filtered);
  //   } else {
  //     console.log(`已取消規劃時間: 員工 ${selectedName}`);
  //   }
  // };
  // 修改 handleSelectSlot：存入所選區間並顯示操作選擇對話框
  const handleSelectSlot = ({ start, end }) => {
    setSelectedSlot({ start, end });
    setShowActionDialog(true);
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
  // 排班處理，保持原樣
  const handleSchedule = async () => {
    try {
      const foundEmployee = employees.find(
        (employee) => employee.name === selectedName
      );
      await createSchedule(
        selectedSlot.start,
        selectedSlot.end,
        selectedTask,
        foundEmployee.employee_id,
        selectedName
      );
      toast.success("排班成功");
      await refreshCalender();
    } catch (error) {
      toast.error("排班失敗");
    } finally {
      setShowActionDialog(false);
    }
  };

  //
  const handleSubmitDivide = async () => {
    if (!selectedSlot || !locationNum || !landNum) {
      alert("請填寫完整分割資訊");
      return;
    }
    const selectedEmployee = employees.find((emp) => emp.name === selectedName);
    if (!selectedEmployee) {
      alert("找不到所選員工");
      return;
    }
    const record = {
      employee_id: selectedEmployee.employee_id,
      start_time: selectedSlot.start.toISOString(),
      end_time: selectedSlot.end.toISOString(),
      location_num: locationNum,
      land_num: landNum,
    };
    try {
      await addDivideRecord(record);
      await refreshCalender();
      toast.success("分割成功");
    } catch (error) {
      toast.error("分割失敗");
    } finally {
      setIsDivideDialogOpen(false);
    }
  };

  const handleSubmitLeave = async () => {
    if (!selectedSlot || !leaveType) {
      alert("請填寫完整請假資訊");
      return;
    }
    const selectedEmployee = employees.find((emp) => emp.name === selectedName);
    if (!selectedEmployee) {
      alert("找不到所選員工");
      return;
    }
    const record = {
      employee_id: selectedEmployee.employee_id,
      start_time: selectedSlot.start.toISOString(),
      end_time: selectedSlot.end.toISOString(),
      leave_type: leaveType,
      reason: leaveReason,
    };
    try {
      await addLeaveRecord(record);
      await refreshCalender();
      toast.success("請假申請成功");
    } catch (error) {
      toast.error("請假申請失敗");
    } finally {
      setIsLeaveDialogOpen(false);
    }
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
  // 基於請假記錄的刪除，假設使用者從 leave record 清單選取後存入 selectedLeave
  const handleDeleteLeave = async () => {
    if (!selectedEvent) return;
    try {
      await deleteLeaveRecord(selectedEvent.leave_id);
      toast.success("請假記錄刪除成功");
      await refreshCalender();
      handleCloseDialog();
      // 如有需要可在此刷新 leave records 清單
    } catch (error) {
      toast.error("請假記錄刪除失敗");
    }
  };
  // 基於分割記錄的刪除，假設使用者從 leave record 清單選取後存入 selectedDivide
  const handleDeleteDivide = async () => {
    if (!selectedEvent) return;
    try {
      await deleteDivideRecord(selectedEvent.divide_id);
      toast.success("分割記錄刪除成功");
      await refreshCalender();
      handleCloseDialog();
      // 如有需要可在此刷新 leave records 清單
    } catch (error) {
      toast.error("分割記錄刪除失敗");
    }
  };
  // 刪除事件的處理，原先的 handleSelectEvent 刪除邏輯搬移至此
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    console.log("刪除事件資料：", selectedEvent);

    await deleteSchedule(selectedEvent);
    await refreshCalender();
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
      await completeTask(selectedEvent, taskEndDate);
    } catch (error) {
      console.error("Error completing task:", error);
      alert("Error completing task: " + error.message);
    }
    refreshCalender();
    handleCloseDialog();
  };
  const handleAddSchedule = async () => {
    if (!newScheduleStart || !newScheduleEnd) {
      alert("請選擇完整的新增排班時間");
      return;
    }
    try {
      const foundEmployee = employees.find(
        (employee) => employee.name === selectedName
      );
      await createSchedule(
        newScheduleStart,
        newScheduleEnd,
        selectedTask,
        foundEmployee.employee_id,
        selectedName
      );
      toast.success("新增排班成功");
      await refreshCalender();
      // 清除輸入的排班時間
      setNewScheduleStart(null);
      setNewScheduleEnd(null);
    } catch (error) {
      toast.error(error.response.data.error);
    }
  };
  // BigCalendar 的 eventPropGetter 利用 mapping 指定顏色
  const eventPropGetter = (event, start, end, isSelected) => {
    // 根據 event.name 取得對應的顏色，若 mapping 中沒有則使用預設顏色
    var backgroundColor = "";
    if (event.is_scheduled === 1) {
      backgroundColor = "#ff4d4d";
    } else if (event.leave_type) {
      backgroundColor = "#747e8c";
    } else if (event.divide_id) {
      backgroundColor = "#BDB76B";
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
      {/* 操作選擇對話框：讓使用者選擇排班或請假 */}
      {showActionDialog && selectedSlot && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">選擇操作</h3>
            <p className="mb-4">
              選擇時間：{selectedSlot.start.toLocaleString()} -{" "}
              {selectedSlot.end.toLocaleString()}
            </p>
            <div className="flex justify-around">
              <button
                onClick={handleSchedule}
                className="bg-blue-500 text-white px-3 py-2 rounded-md"
              >
                排班
              </button>
              <button
                onClick={() => {
                  setShowActionDialog(false);
                  setIsDivideDialogOpen(true);
                }}
                className="bg-yellow-500 text-white px-3 py-2 rounded-md"
              >
                分割
              </button>
              <button
                onClick={() => {
                  setShowActionDialog(false);
                  setIsLeaveDialogOpen(true);
                }}
                className="bg-yellow-500 text-white px-3 py-2 rounded-md"
              >
                請假
              </button>
            </div>
            <button
              onClick={() => setShowActionDialog(false)}
              className="mt-4 text-gray-500"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 分割對話框 */}
      {isDivideDilogOpen && selectedSlot && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">分割申請</h3>
            <p className="mb-2">
              分割時間：{selectedSlot.start.toLocaleString()} -{" "}
              {selectedSlot.end.toLocaleString()}
            </p>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">分割地段</label>
              <input
                type="text"
                value={locationNum}
                onChange={(e) => setDivideLocation(e.target.value)}
                className="border p-2 w-full"
                placeholder="輸入地段"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-1">分割地號</label>
              <input
                type="text"
                value={landNum}
                onChange={(e) => setDivideLandNum(e.target.value)}
                className="border p-2 w-full"
                placeholder="輸入地號"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDivideDialogOpen(false)}
                className="px-3 py-2 bg-gray-500 text-white rounded-md"
              >
                取消
              </button>
              <button
                onClick={handleSubmitDivide}
                className="px-3 py-2 bg-green-500 text-white rounded-md"
              >
                送出
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 請假對話框 */}
      {isLeaveDialogOpen && selectedSlot && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">請假申請</h3>
            <p className="mb-2">
              請假時間：{selectedSlot.start.toLocaleString()} -{" "}
              {selectedSlot.end.toLocaleString()}
            </p>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">請假類別</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="border p-2 w-full"
              >
                <option value="病假">病假</option>
                <option value="事假">事假</option>
                <option value="特休">特休</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-1">請假原因</label>
              <input
                type="text"
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                className="border p-2 w-full"
                placeholder="輸入請假原因"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsLeaveDialogOpen(false)}
                className="px-3 py-2 bg-gray-500 text-white rounded-md"
              >
                取消
              </button>
              <button
                onClick={handleSubmitLeave}
                className="px-3 py-2 bg-green-500 text-white rounded-md"
              >
                送出
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Dialog Modal */}
      {showDialog && selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          {selectedEvent.task_id && (
            <div className="relative bg-white p-6 rounded-md shadow-md w-96">
              <h3 className="text-xl font-semibold mb-4">操作選擇</h3>
              {/* 顯示與 formattedText 相同的案件詳細資訊 */}
              {!isEditing ? (
                <div>
                  <pre className="bg-gray-100 p-2 rounded-md mb-4 whitespace-pre-wrap text-sm flex-col">
                    {`案件編號：${selectedEvent.task_id}
工作人員: ${selectedEvent.name}
地段號: ${selectedEvent.local_point}
界釘數: ${selectedEvent.stake_point}
丈量面積: ${selectedEvent.work_area}
複丈時間:
${formatDateToTaiwanTime(selectedEvent.check_time)}`}
                  </pre>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setUpdatedLocalPoint(selectedEvent.local_point);
                      setUpdatedStakePoint(selectedEvent.stake_point);
                      setUpdatedWorkArea(selectedEvent.work_area);
                      setUpdatedCheckTime(selectedEvent.check_time);
                    }}
                    className="bg-blue-500 text-white px-3 py-2 rounded-md mb-4"
                  >
                    修改
                  </button>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="mb-2">
                    <label className="block text-sm font-bold">地段號</label>
                    <input
                      type="text"
                      value={updatedLocalPoint}
                      onChange={(e) => setUpdatedLocalPoint(e.target.value)}
                      className="border p-2 w-full"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-bold">界釘數</label>
                    <input
                      type="number"
                      value={updatedStakePoint}
                      onChange={(e) => setUpdatedStakePoint(e.target.value)}
                      className="border p-2 w-full"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-bold">丈量面積</label>
                    <input
                      type="number"
                      value={updatedWorkArea}
                      onChange={(e) => setUpdatedWorkArea(e.target.value)}
                      className="border p-2 w-full"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-bold">複丈時間</label>
                    <DatePicker
                      selected={new Date(updatedCheckTime)}
                      onChange={(date) => {
                        console.log(date);
                        setUpdatedCheckTime(date);
                      }}
                      showTimeSelect
                      dateFormat="Pp"
                      className="border p-2 w-full"
                    />
                  </div>
                {/*嘗試 */}
                <div className="flex flex-col mt-2">
                <label className="block text-sm font-bold">時間變更</label>
                <div className="flex justify-around space-x-2">
                  <div>
                    <DatePicker
                      selected={newScheduleStart}
                      onChange={(date) => setNewScheduleStart(date)}
                      showTimeSelect
                      dateFormat="Pp"
                      className="border p-2 w-full"
                      placeholderText="排班開始時間"
                    />
                  </div>
                  <div>
                    <DatePicker
                      selected={newScheduleEnd}
                      onChange={(date) => setNewScheduleEnd(date)}
                      showTimeSelect
                      dateFormat="Pp"
                      className="border p-2 w-full"
                      placeholderText="排班結束時間"
                    />
                  </div>
                </div>
                {/*<button
                  onClick={handleAddSchedule}
                  className="mt-2 bg-blue-500 text-white px-3 py-2 rounded-md"
                >
                  送出新增排班
                </button>*/}
              </div>
                {/*嘗試 */}
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={handleUpdate}
                      className="bg-green-500 text-white px-3 py-2 rounded-md"
                    >
                      更新
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-500 text-white px-3 py-2 rounded-md"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}

             {/* <p className="mb-4">
                請選擇要對任務編號 {selectedEvent.task_id} 進行的操作
              </p>*/}

              {/*<div className="flex flex-col mt-2">
                <div className="flex justify-around space-x-2">
                  <div>
                    <DatePicker
                      selected={newScheduleStart}
                      onChange={(date) => setNewScheduleStart(date)}
                      showTimeSelect
                      dateFormat="Pp"
                      className="border p-2 w-full"
                      placeholderText="排班開始時間"
                    />
                  </div>
                  <div>
                    <DatePicker
                      selected={newScheduleEnd}
                      onChange={(date) => setNewScheduleEnd(date)}
                      showTimeSelect
                      dateFormat="Pp"
                      className="border p-2 w-full"
                      placeholderText="排班結束時間"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddSchedule}
                  className="mt-2 bg-blue-500 text-white px-3 py-2 rounded-md"
                >
                  送出新增排班
                </button>
              </div>*/}
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
              <div className="flex justify-around space-x-2 mt-1">
                <button
                  onClick={handleDeleteEvent}
                  className="mt-2 bg-red-500 text-white px-3 py-2 rounded-md w-full"
                >
                  刪除此次排班
                </button>
              </div>
              <button
                onClick={handleCloseDialog}
                className="absolute top-2 right-2 text-gray-500"
              >
                X
              </button>
            </div>
          )}

          {selectedEvent.leave_type && (
            <div className="relative bg-white p-6 rounded-md shadow-md w-96">
              <h3 className="text-xl font-semibold mb-4">操作選擇</h3>

              <div className="flex justify-start space-x-2">
                <button
                  onClick={handleDeleteLeave}
                  className="bg-red-500 text-white px-3 py-2 rounded-md"
                >
                  刪除此次休假
                </button>
              </div>

              <button
                onClick={handleCloseDialog}
                className="absolute top-2 right-2 text-gray-500"
              >
                X
              </button>
            </div>
          )}

          {selectedEvent.divide_id && (
            <div className="relative bg-white p-6 rounded-md shadow-md w-96">
              <h3 className="text-xl font-semibold mb-4">操作選擇</h3>

              <div className="flex justify-start space-x-2">
                <button
                  onClick={handleDeleteDivide}
                  className="bg-red-500 text-white px-3 py-2 rounded-md"
                >
                  刪除此次分割
                </button>
              </div>

              <button
                onClick={handleCloseDialog}
                className="absolute top-2 right-2 text-gray-500"
              >
                X
              </button>
            </div>
          )}
        </div>
      )}

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default EmployeeCalendarPage;
