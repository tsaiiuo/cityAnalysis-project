import React from "react";

const EventComponent = ({ event }) => {
  const formatDateToTaiwanTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
  };

  // 若 event 具有 leave_type 屬性，表示為請假記錄，呈現請假資訊
  if (event.leave_type) {
    return (
      <div className="">
        <p className="text-[12px] font-medium" style={{ color: "black" }}>
          請假類型: {event.leave_type}
        </p>
        {event.reason && (
          <p className="text-[10px] mt-1" style={{ color: "black" }}>
            請假原因: {event.reason}
          </p>
        )}
        <p className="text-[10px] mt-1" style={{ color: "black" }}>
          請假時間
        </p>
        <p className="text-[10px] mt-1" style={{ color: "black" }}>
          {formatDateToTaiwanTime(event.start)}
        </p>
        <p className="text-[10px] mt-1" style={{ color: "black" }}>
          {formatDateToTaiwanTime(event.end)}
        </p>
      </div>
    );
  } else if(event.divide_id){
    return (
      <div className="">
        <p className="text-[12px] font-medium" style={{ color: "black" }}>
          分割地段: {event.location_num}
        </p>
        <p className="text-[12px] font-medium" style={{ color: "black" }}>
          分割地號: {event.land_num}
        </p>
        <p className="text-[10px] mt-1" style={{ color: "black" }}>
          {formatDateToTaiwanTime(event.start)}
        </p>
        <p className="text-[10px] mt-1" style={{ color: "black" }}>
          {formatDateToTaiwanTime(event.end)}
        </p>
      </div>
    );
  } else if (event.is_scheduled !== undefined) {
    // 原本的排班記錄
    return (
      <div>
        <p
          style={{ color: event.is_scheduled === 0 ? "#6b7280" : "black" }}
          className="text-[12px] font-medium"
        >
          {event.is_scheduled === 0 ? "尚未完成" : "已完成"}
        </p>
        <p style={{ color: "black" }} className="font-medium text-[12px] mt-1">
          地段: {event.land_section}
        </p>
        <p style={{ color: "black" }} className="font-medium text-[12px] mt-1">
          地號: {event.local_point}
        </p>
        <p
          style={{ color: event.is_scheduled === 0 ? "#6b7280" : "black" }}
          className="text-[10px] mt-1"
        >
          複丈時間:
        </p>
        <p
          style={{ color: event.is_scheduled === 0 ? "#6b7280" : "black" }}
          className="text-[10px] mt-1"
        >
          {formatDateToTaiwanTime(event.check_time)}
        </p>
        <p
          style={{ color: event.is_scheduled === 0 ? "#6b7280" : "black" }}
          className="text-[10px] mt-1"
        >
          {event.name}
        </p>
      </div>
    );
  } else {
    // 若不符合以上條件，則提供預設顯示
    return <div className="text-[12px]">未知事件</div>;
  }
};

export default EventComponent;
