"use client";
import React from "react";
import { DigitalClock } from "./digital-clock";

export function DigitalClockClient() {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Load initial state from localStorage
    const saved = localStorage.getItem('admin-clock-visible');
    if (saved !== null) {
      setIsVisible(JSON.parse(saved));
    }

    // Listen for custom clock visibility change events
    const handleClockVisibilityChange = (event) => {
      setIsVisible(event.detail);
    };

    window.addEventListener('clockVisibilityChanged', handleClockVisibilityChange);
    return () => window.removeEventListener('clockVisibilityChanged', handleClockVisibilityChange);
  }, []);

  return <DigitalClock isVisible={isVisible} />;
}