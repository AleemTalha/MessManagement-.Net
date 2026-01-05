"use client";
import React from "react";

export function DigitalClock({ isVisible }) {
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [showColon, setShowColon] = React.useState(true);

  React.useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setShowColon(prev => !prev);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return { hours, minutes };
  };

  const formatDate = (date) => {
    const day = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const dayNum = date.getDate().toString().padStart(2, '0');
    return `${day}, ${month} ${dayNum}`;
  };

  const { hours, minutes } = formatTime(currentTime);

  return (
    <div className="fixed bottom-6 right-6 bg-slate-900 px-8 py-6 rounded-lg shadow-xl border border-slate-700">
      <div className="flex items-baseline gap-1 ">
        <span className="text-6xl font-bold text-slate-100 tabular-nums">{hours}</span>
        <span className="text-6xl font-bold text-slate-100" style={{ visibility: showColon ? 'visible' : 'hidden' }}>:</span>
        <span className="text-6xl font-bold text-slate-100 tabular-nums">{minutes}</span>
      </div>
      <div className="text-sm text-slate-400 tracking-wide mt-2 text-center">
        {formatDate(currentTime)}
      </div>
    </div>
  );
}