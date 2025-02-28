// FeatureBoxes.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import Image from "next/image";
import { getAllCases } from "@/utils/helpers";

let cachedNumbers = null;

export default function FeatureBoxes() {
    const [numbers, setNumbers] = useState({
        registeredToday: 0,
        averageEvidencesPerCase: 0,
        totalCases: 0,
    });

    useEffect(() => {
        let isMounted = true;

        async function fetchNumbers() {
            if (cachedNumbers) {
                if (isMounted) {
                    setNumbers(cachedNumbers);
                }
            } else {
                try {
                    const { cases } = await getAllCases();
                    const totalCases = cases.length;
                    const today = new Date().toISOString().slice(0, 10);
                    const registeredToday = cases.filter(
                        (caseItem) => caseItem.startDateTime.slice(0, 10) === today
                    ).length;
                    let totalEvidences = 0;
                    for (const caseItem of cases) {
                        totalEvidences += caseItem.totalEvidences;
                    }
                    const averageEvidencesPerCase =
                        totalCases > 0 ? (totalEvidences / totalCases).toFixed(2) : 0;
                    const fetchedNumbers = {
                        registeredToday,
                        averageEvidencesPerCase,
                        totalCases,
                    };
                    if (isMounted) {
                        setNumbers(fetchedNumbers);
                        cachedNumbers = fetchedNumbers;
                    }
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            }
        }

        fetchNumbers();
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
        <div className="flex flex-wrap justify-between gap-8 p-8 bg-[rgb(23,0,108)]">
            {boxes.map((box, index) => (
                <div
                    key={index}
                    className="bg-white border border-gray-200 p-6 rounded-lg shadow-lg flex flex-col items-start justify-between w-full md:w-[30%] min-w-[280px] overflow-hidden relative transform transition-transform duration-300 hover:-translate-x-1"
                >
                    {/* Info Button */}
                    <div className="absolute top-4 right-4">
                        <Tooltip text={box.info}>
                            <button className="focus:outline-none">
                                <Info size={24} color="#555" />
                            </button>
                        </Tooltip>
                    </div>
                    {/* Icon */}
                    <Image
                        src={box.icon}
                        alt={box.heading}
                        width={80}
                        height={80}
                        className="mb-4"
                    />
                    {/* Heading */}
                    <h3 className="text-xl font-bold text-left text-gray-800">
                        {box.heading}
                    </h3>
                    {/* Description */}
                    <p className="text-lg font-bold text-left text-[rgb(37,0,172)] mt-2">
                        {box.description}: {box.number}
                    </p>
                    {/* Use Feature Link */}
                    <div className="mt-4 w-full border-t border-gray-300 pt-4 flex items-center justify-between">
                        <Link href={box.link}>
                            <span className="text-[rgb(217,155,0)] font-bold text-lg cursor-pointer feature-text transition-colors duration-300 hover:text-red-600">
                                Use this Feature
                            </span>
                        </Link>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-gray-700 arrow-icon opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            ))}
        </div>
    );
}

function Tooltip({ text, children }) {
    const [visible, setVisible] = useState(false);

    const handleClick = () => setVisible(!visible);

    return (
        <div className="relative inline-block">
            <div onClick={handleClick}>{children}</div>
            {visible && (
                <div className="absolute top-8 right-0 bg-gray-800 text-white p-2 rounded-md text-sm z-10 whitespace-nowrap">
                    {text}
                </div>
            )}
        </div>
    );
}
