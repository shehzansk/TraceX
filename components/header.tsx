"use client";
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const Header = () => {
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
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
        hours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
        return `${day} ${month}, ${year} | ${hours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
    };

    return (
        <div className="w-full bg-[rgb(23,0,108)] text-white font-semibold text-sm shadow-lg sticky top-0 z-50">
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-4 py-2 md:hidden">
                <div>{currentTime ? formatDateTime(currentTime) : "Loading..."}</div>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-label="Toggle Dropdown"
                    className="focus:outline-none"
                >
                    <ChevronDown size={24} />
                </button>
            </div>

            {/* Dropdown Content */}
            <div
                className={`overflow-hidden transition-[max-height] duration-300 ease-in-out md:hidden bg-[rgb(23,0,108)] text-white px-4 ${isDropdownOpen ? 'max-h-40' : 'max-h-0'
                    }`}
            >
                <div className="py-2">
                    <div className="flex items-center gap-2">
                        <a href="/" className="text-white no-underline">⛓️ TraceX</a>
                        <span>|</span>
                        <div>
                            <button className="m-1 text-xs">-A</button>
                            <button className="m-1 text-xs">A</button>
                            <button className="m-1 text-xs">+A</button>
                        </div>
                        <span>|</span>
                        <select className="text-black bg-white border border-gray-300 p-1 text-xs">
                            <option value="en">English</option>
                            <option value="kn">Kannada</option>
                            <option value="ta">Tamil</option>
                            <option value="mr">Marathi</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between px-4 py-2">
                <div>{currentTime ? formatDateTime(currentTime) : "Loading..."}</div>
                <div className="flex items-center gap-2">
                    <a href="/" className="text-white no-underline">⛓️ TraceX</a>
                    <span>|</span>
                    <div>
                        <button className="m-1 text-xs">-A</button>
                        <button className="m-1 text-xs">A</button>
                        <button className="m-1 text-xs">+A</button>
                    </div>
                    <span>|</span>
                    <select className="text-black bg-white border border-gray-300 p-1 text-xs">
                        <option value="en">English</option>
                        <option value="kn">Kannada</option>
                        <option value="ta">Tamil</option>
                        <option value="mr">Marathi</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default Header;
