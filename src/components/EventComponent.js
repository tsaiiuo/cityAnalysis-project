import React, { useState } from "react";

const EventComponent = ({ event }) => {
  const formatDateToTaiwanTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
  };

  return (
    <div>
      <strong>案件編號：{event.task_id}</strong>
      <p className="text-gray-500 text-[10px] mt-1">
        {event.is_scheduled === 0 ? "任務尚未完成" : "任務已完成"}
      </p>{" "}
      <p className="text-gray-500 text-[10px] mt-1">複丈時間:</p>
      <p className="text-gray-500 text-[10px] mt-1">
        {formatDateToTaiwanTime(event.check_time)}
      </p>{" "}
      <p className="text-gray-500 text-[10px] mt-1">工作人員: {event.name}</p>
    </div>
  );
};

export default EventComponent;
