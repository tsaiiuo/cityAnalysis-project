import React, { useState } from "react";

const LitleComponent = ({ event }) => {
  const formatDateToTaiwanTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
  };

  return (
    <div>
      <p className="text-black font-medium text-[13px]">
        地號:{event.local_point}
      </p>{" "}
      <p className="text-gray-500 text-[10px] mt-1">
        {event.is_scheduled === 0 ? "任務尚未完成" : "任務已完成"}
      </p>{" "}
      <p className="text-gray-500 text-[10px] mt-1">複丈時間:</p>
      <p className="text-gray-500 text-[10px] mt-1">
        {formatDateToTaiwanTime(event.check_time)}
      </p>{" "}
      <p className="text-gray-500 text-[10px] mt-1">{event.name}</p>
    </div>
  );
};

export default LitleComponent;
