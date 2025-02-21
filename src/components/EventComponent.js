import React, { useState } from "react";
import clsx from "clsx";

const EventComponent = ({ event }) => {
  const formatDateToTaiwanTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
  };
  console.log(event);
  return (
    <div>
      <p
        style={{ color: event.is_scheduled === 1 ? "black" : "#6b7280" }}
        className="text-[12px] font-medium"
      >
        {event.is_scheduled === 0 ? "尚未完成" : "已完成"}
      </p>
      <p
        style={{ color: event.is_scheduled === 1 ? "black" : "black" }}
        className="font-medium text-[12px] mt-1"
      >
        地段:{event.land_section}
      </p>
      <p
        style={{ color: event.is_scheduled === 1 ? "black" : "black" }}
        className="font-medium text-[12px] mt-1"
      >
        地號:{event.local_point}
      </p>

      <p
        style={{ color: event.is_scheduled === 1 ? "black" : "#6b7280" }}
        className="text-[10px] mt-1"
      >
        複丈時間:
      </p>
      <p
        style={{ color: event.is_scheduled === 1 ? "black" : "#6b7280" }}
        className="text-[10px] mt-1"
      >
        {formatDateToTaiwanTime(event.check_time)}
      </p>
      <p
        style={{ color: event.is_scheduled === 1 ? "black" : "#6b7280" }}
        className="text-[10px] mt-1"
      >
        {event.name}
      </p>
    </div>
  );
};

export default EventComponent;
