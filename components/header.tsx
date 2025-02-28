"use client";
import React, { useState, useEffect } from 'react';

const Header = () => {
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    useEffect(() => {
        // Set the initial time after mounting
        setCurrentTime(new Date());

        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDateTime = (date: Date) => {
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();

        let hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        if (hours === 0) hours = 12;

        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

        return `${day} ${month}, ${year} | ${hours} : ${formattedMinutes} : ${formattedSeconds} ${ampm}`;
    };

    return (
        <div
            style={{
                width: "100%",
                height: "50px",
                backgroundColor: "rgb(23, 0, 108)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px 0 24px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)",
                position: "sticky",
                top: 0,
                zIndex: 1100,
                color: "white",
                fontSize: "0.9rem"
            }}
        >
            {/* Left Side - Render time only after mounting */}
            <div>
                {currentTime ? formatDateTime(currentTime) : "Loading..."}
            </div>

            {/* Right Side - Navigation and controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <a
                    href="/"
                    style={{ color: "white", textDecoration: "none" }}
                >
                    ⛓️TraceX
                </a>
                <span style={{ color: "white" }}>|</span>
                <div>
                    <button style={{ margin: "0 3px", fontSize: "0.8rem" }}>-A</button>
                    <button style={{ margin: "0 3px", fontSize: "0.8rem" }}>A</button>
                    <button style={{ margin: "0 3px", fontSize: "0.8rem" }}>+A</button>
                </div>
                <span style={{ color: "white" }}>|</span>
                <select
                    style={{
                        color: "black",
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                        padding: "2px",
                        fontSize: "0.8rem"
                    }}
                >
                    <option value="en">English</option>
                    <option value="mr">Kannada</option>
                    <option value="tm">Tamil</option>
                    <option value="ben">Marathi</option>
                </select>
            </div>
        </div>
    );
};

export default Header;
