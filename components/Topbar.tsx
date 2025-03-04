"use client";

import React, { useState, memo } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { IconButton } from '@chakra-ui/react';
import { useChatbot } from '../context/ChatbotContext';

const ConnectButton = dynamic(
    () =>
        import('@rainbow-me/rainbowkit').then((mod) => mod.ConnectButton),
    { ssr: false }
);

const TopBar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { toggleChatbot } = useChatbot();

    const linkStyle =
        "text-decoration-none text-[1.15rem] hover:text-red-500 transition-colors duration-300 px-4 pb-1 relative font-cinzel";

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
                <div className="relative bg-white w-3/4 max-w-xs h-full shadow-lg flex flex-col">
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
                        {/* Chatbot Icon Option in Mobile Drawer */}
                        <div className="pt-4 border-t border-gray-300">
                        <button 
                            onClick={() => { toggleChatbot(); setIsSidebarOpen(false); }}
                            className="flex items-center gap-2 w-full text-[1.15rem] font-cinzel hover:text-red-500 transition-colors duration-300"
                        >
                            <Image 
                                src="/chatbot-robot.png" 
                                alt="Chatbot" 
                                width={30} 
                                height={30} 
                                unoptimized={true} 
                                className="w-8 h-8"
                            />
                            Chatbot
                        </button>
                        </div>
                    </nav>
                    <div className="px-4 mt-6">
                        <ConnectButton />
                    </div>
                </div>
            </div>

            {/* Desktop TopBar */}
            <div className="hidden md:flex items-end justify-between px-6 py-2">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    <Image src="/gov.png" alt="CCITR Logo" width={240} height={180} />
                    <button onClick={toggleChatbot} aria-label="Open Chat">
                        <Image 
                            src="/chatbot-robot.png" 
                            alt="Chatbot" 
                            width={40} 
                            height={40} 
                            unoptimized={true} 
                            className="w-20 h-20 hover:scale-110 transition-transform duration-300"
                        />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex items-end h-full">
                    {/* First Link */}
                    <div className="flex items-end">
                        <a href="/" className={linkStyle}>Home</a>
                    </div>

                    {/* Separator and Other Links */}
                    {[{ href: "/admin", label: "Admin" }, { href: "/about", label: "About" }, { href: "/cases", label: "Case-List" }].map((link, index) => (
                        <div key={index} className="flex items-end">
                            {/* Separator */}
                            <span className="hidden md:inline-block text-gray-500 px-4 pb-1 self-center">|</span>
                            {/* Link */}
                            <a href={link.href} className={linkStyle}>{link.label}</a>
                        </div>
                    ))}
                </nav>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    <Image src="/ccitr.jpg" alt="CID Karnataka Logo" width={80} height={80} />
                    <div className="ml-4">
                        <ConnectButton /> {/* Now dynamically imported */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(TopBar);
