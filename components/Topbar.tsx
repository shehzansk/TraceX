// TopBar.tsx
import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

const TopBar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const linkStyle =
        "text-decoration-none text-xl hover:text-red-500 transition-colors duration-300 px-3 pb-1 relative font-cinzel";

    return (
        <div className="relative bg-gray-100 shadow-md">
            {/* Mobile TopBar */}
            <div className="flex items-center justify-between px-4 py-2 md:hidden">
                <Image src="/gov.png" alt="CCITR Logo" width={120} height={90} />
                <button onClick={() => setIsSidebarOpen(true)} aria-label="Open Sidebar">
                    <Menu size={24} />
                </button>
            </div>

            {/* Sidebar */}
            <div
                className={`fixed inset-0 z-50 transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Overlay */}
                <div
                    className="absolute inset-0 bg-black opacity-50"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>

                {/* Sidebar Content */}
                <div className="relative bg-white w-3/4 max-w-xs h-full shadow-lg">
                    <div className="flex items-center justify-between p-4">
                        <Image src="/ccitr.jpg" alt="CID Karnataka Logo" width={60} height={60} />
                        <button onClick={() => setIsSidebarOpen(false)} aria-label="Close Sidebar">
                            <X size={24} />
                        </button>
                    </div>
                    <nav className="flex flex-col space-y-4 px-4">
                        <a href="/" className={linkStyle}>Home</a>
                        <a href="/admin" className={linkStyle}>Admin</a>
                        <a href="/about" className={linkStyle}>About</a>
                        <a href="/cases" className={linkStyle}>Case-List</a>
                    </nav>
                    <div className="px-4 mt-6">
                        <ConnectButton />
                    </div>
                </div>
            </div>

            {/* Desktop TopBar */}
            <div className="hidden md:flex items-end justify-between px-6 py-2">
                {/* Left Section */}
                <div className="flex items-center">
                    <Image src="/gov.png" alt="CCITR Logo" width={240} height={180} />
                </div>
                {/* Navigation Links */}
                <nav className="flex space-x-8 h-full">
                    <a href="/" className={linkStyle}>Home</a>
                    <a href="/admin" className={linkStyle}>Admin</a>
                    <a href="/about" className={linkStyle}>About</a>
                    <a href="/cases" className={linkStyle}>Case-List</a>
                </nav>
                {/* Right Section */}
                <div className="flex items-center">
                    <Image src="/ccitr.jpg" alt="CID Karnataka Logo" width={80} height={80} />
                    <div className="ml-4">
                        <ConnectButton />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
