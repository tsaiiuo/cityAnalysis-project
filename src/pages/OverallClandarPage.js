import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Calendar from "react-calendar";

import "react-calendar/dist/Calendar.css";

const events = [
  {
    id: 1,
    title: "Lorem ipsum dolor",
    time: "12:00 PM - 2:00 PM",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: 2,
    title: "Lorem ipsum dolor",
    time: "12:00 PM - 2:00 PM",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: 3,
    title: "Lorem ipsum dolor",
    time: "12:00 PM - 2:00 PM",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
];

const OverrallCalendarPage = () => {
  const [value, onChange] = useState(new Date());

  return (
    <div className="flex h-screen p-4">
      <Sidebar />
      <div className="">
        <div className="flex-1 bg-white p-6 rounded-md max-w-4xl mx-auto mt-10">
          <Calendar onChange={onChange} value={value} className="mb-8" />
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">Events</h1>
          </div>
          <div className="flex flex-col gap-6">
            {events.map((event) => (
              <div
                className="p-5 rounded-md border-2 border-gray-200 border-t-4 odd:border-t-blue-400 even:border-t-purple-400"
                key={event.id}
              >
                <div className="flex items-center justify-between">
                  <h1 className="font-semibold text-gray-700">{event.title}</h1>
                  <span className="text-gray-400 text-sm">{event.time}</span>
                </div>
                <p className="mt-3 text-gray-500 text-sm">
                  {event.description}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={() => console.log(value)}
            className="bg-black text-white p-4 mt-6 hover:bg-gray-800 w-full"
          >
            分派
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverrallCalendarPage;
