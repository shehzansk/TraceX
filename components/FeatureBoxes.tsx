"use client";
import { useState } from "react";
import Link from "next/link";
import { Info } from "lucide-react";

const boxes = [
    {
        icon: "regcase.png", // Replace with your actual icon path
        heading: "Register a Case",
        link: "/register-case",
        description: "Registered today",
        number: 10,
        info: "Initiate a new contract and register your case details.",
    },
    {
        icon: "submitevd.png", // Replace with your actual icon path
        heading: "Submit Evidence",
        link: "/submit-evidence",
        description: "Avg(Evidences) per Case",
        number: 1000,
        info: "Upload and submit evidence securely on the blockchain.",
    },
    {
        icon: "getevd.png", // Replace with your actual icon path
        heading: "Explore Cases",
        link: "/cases",
        description: "Total Cases",
        number: 5,
        info: "Browse and review the evidences & cases submitted to the system.",
    },
];

export default function FeatureBoxes() {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "40px", // Space between boxes
                padding: "80px 40px 40px 40px",
                backgroundColor: "rgb(23, 0, 108)",
                flexWrap: "wrap",
            }}
        >
            {boxes.map((box, index) => (
                <Link
                    key={index}
                    href={box.link}
                    style={{ textDecoration: "none", flex: "1", minWidth: "300px", maxWidth: "32%" }}
                >
                    <div
                        style={{
                            backgroundColor: "#fff",
                            border: "1px solid #e2e2e2",
                            padding: "20px",
                            paddingTop: "10px",
                            height: "300px",
                            display: "flex",
                            flexDirection: "column",
                            borderRadius: "8px",
                            alignItems: "flex-start",
                            justifyContent: "center",
                            position: "relative",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                            cursor: "pointer",
                            transition: "transform 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.02)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                        }}
                    >
                        {/* Info Icon at Top Right */}
                        <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                            <Tooltip text={box.info}>
                                <Info size={18} color="#555" />
                            </Tooltip>
                        </div>

                        {/* Box Content */}
                        <img src={box.icon} alt={box.heading} style={{ height: "100px", marginBottom: "15px" }} />
                        <h3 style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#333", textAlign: "left", width: "100%" }}>
                            {box.heading}
                        </h3>
                        <p style={{ fontSize: "1.2rem", fontWeight: "bold", color: "rgb(37, 0, 172)", textAlign: "left", marginTop: "5px", width: "100%" }}>
                            {box.description}: {box.number}
                        </p>
                        <div
                            style={{
                                marginTop: "20px",
                                width: "100%",
                                borderTop: "1px solid #ccc",
                                paddingTop: "10px",
                            }}
                        >
                            <span
                                style={{
                                    color: "rgb(217, 155, 0)",
                                    fontSize: "1.1rem",
                                    fontWeight: "bold",
                                    fontFamily: "Arial, sans-serif",
                                }}
                            >
                                Use this Feature
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

function Tooltip({ text, children }) {
    const [visible, setVisible] = useState(false);

    return (
        <div
            style={{ position: "relative", display: "inline-block" }}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {children}
            {visible && (
                <div
                    style={{
                        position: "absolute",
                        top: "25px",
                        right: "0",
                        backgroundColor: "#333",
                        color: "#fff",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        fontSize: "0.9rem",
                        whiteSpace: "nowrap",
                        zIndex: "10",
                    }}
                >
                    {text}
                </div>
            )}
        </div>
    );
}
