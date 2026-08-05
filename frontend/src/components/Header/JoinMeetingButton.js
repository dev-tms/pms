import React, { useEffect, useState } from "react";
import { Video } from "lucide-react";

const JoinMeetingButton = () => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  useEffect(() => {
    const checkAnimation = () => {
      const now = new Date();

      const start = new Date();
      start.setHours(10, 25, 0);
      // start.setHours(12, 46, 0);

      const end = new Date();
      end.setHours(11, 0, 0);
      // end.setHours(12, 48, 0);

      const todayKey = new Date().toDateString();
      const clickedDate = localStorage.getItem("meetingClicked");

      if (now >= start && now <= end && clickedDate !== todayKey) {
        setShouldAnimate(true);
      } else {
        setShouldAnimate(false);
      }
    };

    checkAnimation();

    // Optional: live check every 30 sec (no refresh needed)
    const interval = setInterval(checkAnimation, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    const todayKey = new Date().toDateString();
    localStorage.setItem("meetingClicked", todayKey);
    setShouldAnimate(false);
  };

  return (
    <a
      href={process.env.REACT_APP_MEETING_LINK}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      style={{ padding: "15px 18px" }}
      className={"group flex items-center gap-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition " + (shouldAnimate ? "animate-vibrate" : "")}
    >
      <Video />
      <span className="hidden lg:block text-[14px]">
        Join Meeting
      </span>
    </a>
  );
};

export default JoinMeetingButton;