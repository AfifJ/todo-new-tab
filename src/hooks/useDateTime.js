import { useState, useEffect } from 'react';

export function useDateTime() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [dayPercentage, setDayPercentage] = useState("")

  const updateDateTime = () => {
    const today = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setDate(today.toLocaleDateString("en-US", options));

    const hours = today.getHours().toString().padStart(2, "0");
    const minutes = today.getMinutes().toString().padStart(2, "0");
    setTime(`${hours}:${minutes}`);

    const totalMinutesPassed = parseInt(hours) * 60 + parseInt(minutes);
    const totalMinutesInDay = 24 * 60;
    
    const percentage = (totalMinutesPassed / totalMinutesInDay) * 100;
    setDayPercentage(percentage.toFixed(1))
  };

  useEffect(() => {
    updateDateTime();
    // Update time every minute
    const timeInterval = setInterval(updateDateTime, 60000);
    return () => clearInterval(timeInterval);
  }, []);

  return { date, time, dayPercentage };
}
