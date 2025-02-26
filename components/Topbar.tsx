import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';

const TopBar = () => {
    return (
        <div
            style={{
                position: 'relative',
                left: 0,
                right: 0,
                height: '100px',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
        >
            {/* LEFT SECTION */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <Image
                    src="/gov.png"
                    alt="CCITR Logo"
                    width={240}
                    height={180}
                />
            </div>

            {/* NAVIGATION LINKS (CENTER, NOW ALIGNED AT THE BOTTOM) */}
            <nav
                style={{
                    flex: 1,
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    alignItems: 'flex-end', // Ensures links are at the bottom
                    paddingBottom: '8px', // Adds spacing for balance
                }}
            >
                <a href="/" style={linkStyle}>Home</a>
                <a href="/admin" style={linkStyle}>Admin</a>
                <a href="/about" style={linkStyle}>About</a>
                <a href="/services" style={linkStyle}>Services</a>
            </nav>

            {/* RIGHT SECTION */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                }}
            >
                <Image
                    src="/ccitr.jpg"
                    alt="CID Karnataka Logo"
                    width={80}
                    height={80}
                />
                <div style={{ marginLeft: '16px' }}>
                    <ConnectButton />
                </div>
            </div>
        </div>
    );
};

// Adjusted font size and positioning
const linkStyle: React.CSSProperties = {
    textDecoration: 'none',
    fontSize: '1rem',
    fontFamily: "'Cinzel', serif",
    color: '#333',
    fontWeight: 'bold',
    padding: '6px 10px',
    position: 'relative',
    transition: 'color 0.3s ease',
    marginBottom: '4px', // Ensures bottom alignment
};

// Injecting hover effect via CSS
if (typeof document !== 'undefined') {
    const hoverEffect = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&display=swap');

  a {
      position: relative;
      text-decoration: none;
  }

  a::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -4px;
      width: 100%;
      height: 2px;
      background-color: #333;
      transform: scaleX(0);
      transition: transform 0.3s ease-in-out;
  }

  a:hover {
      color: #000;
  }

  a:hover::after {
      transform: scaleX(1);
  }
`;
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = hoverEffect;
    document.head.appendChild(styleSheet);
}

export default TopBar;
