import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  Calendar as BigCalendar,
  momentLocalizer,
  Views,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const localizer = momentLocalizer(moment);

const EmployeeCalendarPage = () => {
  const [events, setEvents] = useState([
    {
      id: 0,
      title: "Board Meeting",
      name: "Alice",
      start: new Date(2024, 10, 7, 9, 0, 0),
      end: new Date(2024, 10, 7, 13, 0, 0),
    },
    {
      id: 1,
      title: "Team Standup",
      name: "Bob",
      start: new Date(2024, 10, 8, 9, 30, 0),
      end: new Date(2024, 10, 8, 10, 0, 0),
    },
  ]);

  const [value, onChange] = useState(new Date());
  const [view, setView] = useState(Views.WORK_WEEK);
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [dateEvents, setDateEvents] = useState([]);

  const [selectedName, setSelectedName] = useState("All");

  const handleOnChangeView = (selectedView) => {
    setView(selectedView);
  };
  const handleSelectSlot = ({ start, end }) => {
    const title = window.prompt("New Event name");
    if (title) {
      const newEvent = {
        id: events.length,
        title,
        name: selectedName,
        start,
        end,
      };
      setEvents((prevEvents) =>
        [...prevEvents, newEvent].sort((a, b) => a.start - b.start)
      );
      setFilteredEvents((prevFilteredEvents) =>
        selectedName === "All"
          ? [...prevFilteredEvents, newEvent].sort((a, b) => a.start - b.start)
          : newEvent.name === selectedName
          ? [...prevFilteredEvents, newEvent].sort((a, b) => a.start - b.start)
          : prevFilteredEvents
      );
      setDateEvents((prevDateEvents) =>
        selectedName === "All" &&
        value.toDateString() === newEvent.start.toDateString()
          ? [...prevDateEvents, newEvent].sort((a, b) => a.start - b.start)
          : newEvent.name === selectedName &&
            value.toDateString() === newEvent.start.toDateString()
          ? [...prevDateEvents, newEvent].sort((a, b) => a.start - b.start)
          : prevDateEvents
      );
    }
  };

  const handleDateChange = (newDate) => {
    onChange(newDate);
    var filtered = events.filter(
      (event) =>
        newDate.toDateString() === event.start.toDateString() &&
        event.name === selectedName
    );
    filtered = filtered.sort((a, b) => a.start - b.start);
    console.log(filtered);
    setDateEvents(filtered);
  };
  const handleNameChange = (e) => {
    setSelectedName(e.target.value);
    setFilteredEvents(
      e.target.value === "All"
        ? events
        : events
            .filter((event) => event.name === e.target.value)
            .sort((a, b) => a.start - b.start)
    );
    setDateEvents(
      e.target.value === "All"
        ? events
        : events
            .filter(
              (event) =>
                event.name === e.target.value &&
                value.toDateString() === event.start.toDateString()
            )
            .sort((a, b) => a.start - b.start)
    );
  };
  const handleSelectEvent = (event) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the event: "${event.title}"?`
    );
    if (confirmDelete) {
      setEvents((prevEvents) =>
        prevEvents
          .filter((e) => e.id !== event.id)
          .sort((a, b) => a.start - b.start)
      );
      setFilteredEvents((prevFilteredEvents) =>
        prevFilteredEvents
          .filter((e) => e.id !== event.id)
          .sort((a, b) => a.start - b.start)
      );
      setDateEvents((prevDateEvents) =>
        prevDateEvents
          .filter((e) => e.id !== event.id)
          .sort((a, b) => a.start - b.start)
      );
    }
  };

  return (
    <div className="flex flex-row h-screen overflow-y-auto  p-4">
      <Sidebar />

      <div className="flex-1 p-6 w-1/2">
        <div className="flex flex-row items-center  justify-between">
          <div className="text-2xl font-bold p-2">員工排班系統</div>
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
              className="border p-1 text-[12px]  "
            >
              <option value="All">All</option>
              {[...new Set(events.map((event) => event.name))].map((name) => (
                <option key={name} value={name}>
                  {name}
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
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.id % 2 === 0 ? "#FF6F61" : "#6B5B95",
              color: "white", // 修改文本颜色
              borderRadius: "5px", // 修改边框的圆角
              fontSize: "12px",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "", // 增加内边距
            },
          })}
          style={{ height: "98%", margin: "20px" }}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          views={[Views.WORK_WEEK, Views.DAY]}
          onView={handleOnChangeView}
          view={view}
        />
      </div>

      <div className="w-1/4">
        <div className="flex-1 bg-white p-6 rounded-md max-w-4xl mx-auto mt-10">
          <Calendar
            onChange={handleDateChange}
            value={value}
            className="mb-8"
          />
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">Events</h1>
          </div>
          <div className="flex flex-col gap-6">
            {dateEvents.map((event) => (
              <div
                className="p-5 rounded-md border-2 border-gray-200 border-t-4 odd:border-t-blue-400 even:border-t-purple-400"
                key={event.id}
              >
                <div className="flex items-center justify-between">
                  <h1 className="font-semibold text-gray-700">{event.title}</h1>
                </div>
                <div className="flex flex-row items-center justify-between">
                  <span className="text-gray-400 text-sm">
                    {event.start.toLocaleString()} ~
                    {event.end.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="mt-3 text-gray-500 text-sm"></p>
              </div>
            ))}
          </div>
          <button
            onClick={() => console.log(value)}
            className="bg-black text-white p-4 mt-6 hover:bg-gray-800 w-full"
          >
            debug
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCalendarPage;
