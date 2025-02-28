"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import Image from "next/image"; // Import Next.js Image component
import { getAllCases } from "@/utils/helpers"; // Import necessary function

// Cache object to store the fetched data
let cachedNumbers = null;

export default function FeatureBoxes() {
    const [numbers, setNumbers] = useState({
        registeredToday: 0,
        averageEvidencesPerCase: 0,
        totalCases: 0,
    });

    useEffect(() => {
        let isMounted = true; // To prevent state update if component is unmounted

        async function fetchNumbers() {
            if (cachedNumbers) {
                // Use cached data
                if (isMounted) {
                    setNumbers(cachedNumbers);
                }
            } else {
                try {
                    // Fetch all cases
                    const { cases } = await getAllCases();

                    // Total number of cases
                    const totalCases = cases.length;

                    // Get today's date in 'YYYY-MM-DD' format
                    const today = new Date().toISOString().slice(0, 10);

                    // Number of cases registered today
                    const registeredToday = cases.filter(
                        (caseItem) => caseItem.startDateTime.slice(0, 10) === today
                    ).length;

                    // Total evidences
                    let totalEvidences = 0;
                    for (const caseItem of cases) {
                        totalEvidences += caseItem.totalEvidences;
                    }

                    // Average evidences per case
                    const averageEvidencesPerCase =
                        totalCases > 0 ? (totalEvidences / totalCases).toFixed(2) : 0;

                    const fetchedNumbers = {
                        registeredToday,
                        averageEvidencesPerCase,
                        totalCases,
                    };

                    if (isMounted) {
                        setNumbers(fetchedNumbers);
                        // Cache the data
                        cachedNumbers = fetchedNumbers;
                    }
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            }
        }

        fetchNumbers();

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, []);

    const boxes = [
        {
            icon: "/regcase.png",
            heading: "Register a Case",
            link: "/register-case",
            description: "Registered Today",
            number: numbers.registeredToday,
            info: "Initiate a new contract and register your case details.",
        },
        {
            icon: "/submitevd.png",
            heading: "Submit Evidence",
            link: "/submit-evidence",
            description: "Avg(Evidences) per Case",
            number: numbers.averageEvidencesPerCase,
            info: "Upload and submit evidence securely on the blockchain.",
        },
        {
            icon: "/getevd.png",
            heading: "Explore Cases",
            link: "/cases",
            description: "Total Cases",
            number: numbers.totalCases,
            info: "Browse and review the evidences & cases submitted to the system.",
        },
    ];

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
                    style={{
                        textDecoration: "none",
                        flex: "1",
                        minWidth: "300px",
                        maxWidth: "32%",
                    }}
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
                            transition: "all 0.3s ease",
                            overflow: "hidden",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateX(-5px)"; // Move slightly to the left
                            const arrow = e.currentTarget.querySelector(".arrow-icon");
                            if (arrow) arrow.style.opacity = "1"; // Show the arrow
                            const featureText = e.currentTarget.querySelector(".feature-text");
                            if (featureText) featureText.style.color = "rgb(255, 0, 0)"; // Change color on hover
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateX(0)"; // Move back to the original position
                            const arrow = e.currentTarget.querySelector(".arrow-icon");
                            if (arrow) arrow.style.opacity = "0"; // Hide the arrow
                            const featureText = e.currentTarget.querySelector(".feature-text");
                            if (featureText) featureText.style.color = "rgb(217, 155, 0)"; // Revert color
                        }}
                    >
                        {/* Info Icon at Top Right */}
                        <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                            <Tooltip text={box.info}>
                                <Info size={24} color="#555" />
                            </Tooltip>
                        </div>

                        {/* Box Content */}
                        <Image
                            src={box.icon}
                            alt={box.heading}
                            width={100}
                            height={100}
                            style={{ marginBottom: "15px" }}
                        />
                        <h3
                            style={{
                                fontSize: "1.3rem",
                                fontWeight: "bold",
                                color: "#333",
                                textAlign: "left",
                                width: "100%",
                            }}
                        >
                            {box.heading}
                        </h3>
                        <p
                            style={{
                                fontSize: "1.2rem",
                                fontWeight: "bold",
                                color: "rgb(37, 0, 172)",
                                textAlign: "left",
                                marginTop: "5px",
                                width: "100%",
                            }}
                        >
                            {box.description}: {box.number}
                        </p>
                        <div
                            style={{
                                marginTop: "20px",
                                width: "100%",
                                borderTop: "1px solid #ccc",
                                paddingTop: "10px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <span
                                className="feature-text"
                                style={{
                                    color: "rgb(217, 155, 0)",
                                    fontSize: "1.1rem",
                                    fontWeight: "bold",
                                    fontFamily: "Arial, sans-serif",
                                    transition: "color 0.3s ease",
                                }}
                            >
                                Use this Feature
                            </span>
                            {/* Inline SVG for arrow */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="arrow-icon h-6 w-6 text-gray-700"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                                style={{ opacity: "0", transition: "opacity 0.3s ease" }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
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
