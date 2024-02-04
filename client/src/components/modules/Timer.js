import React, { useState, useEffect } from "react";
import "./Timer.css";

const Timer = () => {
    const [seconds, setSeconds] = useState(120);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setSeconds((prevSeconds) => prevSeconds - 1);
        }, 1000);

        // Clear the interval when the timer reaches 0
        if (seconds === 0) {
            clearInterval(intervalId);
        }

        // Cleanup the interval on component unmount
        return () => clearInterval(intervalId);
    }, [seconds]);

    const formatTime = () => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
    };

    return (
        <div className="timer-container">
            <h1 className="timer-text">Timer: {formatTime()}</h1>
        </div>
    );
};

export default Timer;
