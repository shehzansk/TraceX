"use client";
import { Colors } from 'chart.js';
import { useEffect, useState, useRef } from "react";
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Spinner,
    Alert,
    AlertIcon,
    Button,
    useDisclosure,
    useToast,
    Input,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    Textarea,
    Select,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import {
    getCaseById,
    getEvidences,
    isAtLeastAnalyst,
    isCollectorOrAdmin,
    addEvidence,
    convertIPFSUriToUrl,
    getName,
} from "@/utils/helpers";
import axios from "axios";
import { Chart } from "react-chartjs-2";
import {
    CategoryScale,
    Chart as ChartJS,
    LinearScale,
    BarElement,
    TimeScale,
    Tooltip,
    BubbleController,
    PointElement,
} from "chart.js";
import "chartjs-adapter-date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useStorageUpload } from "@thirdweb-dev/react";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// Register the necessary Chart.js controllers/elements
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    TimeScale,
    Tooltip,
    BubbleController,
    PointElement,
    Colors
);

export default function CaseDetails({ params }) {
    const router = useRouter();
    const { caseId } = params;
    const [caseDetails, setCaseDetails] = useState(null);
    const [evidences, setEvidences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [canEdit, setCanEdit] = useState(false);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredEvidences, setFilteredEvidences] = useState([]);
    const [auditTrail, setAuditTrail] = useState(null);
    const [auditLoading, setAuditLoading] = useState(false);
    const [aiReport, setAiReport] = useState("");
    const { isOpen: isAuditOpen, onOpen: onAuditOpen, onClose: onAuditClose } = useDisclosure();
    const { isOpen: isReportOpen, onOpen: onReportOpen, onClose: onReportClose } = useDisclosure();
    const { isOpen: isEvidenceOpen, onOpen: onEvidenceOpen, onClose: onEvidenceClose } = useDisclosure();
    const toast = useToast();
    const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);
    const [file, setFile] = useState([]);
    const [evidenceType, setEvidenceType] = useState(0);
    const evidenceIdRef = useRef(null);
    const officerNameRef = useRef(null);
    const locationRef = useRef(null);
    const evidenceDescriptionRef = useRef(null);

    const closeAllModals = () => {
        onEvidenceClose();
        onAuditClose();
        onReportClose();
    };

    const openEvidenceModal = () => {
        closeAllModals();
        onEvidenceOpen();
    };

    const openAuditModal = () => {
        closeAllModals();
        onAuditOpen();
    };

    const openReportModal = () => {
        closeAllModals();
        onReportOpen();
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const access = await isAtLeastAnalyst();
                setHasAccess(access);
                if (!access) {
                    setError("You do not have permission to view this page.");
                    setLoading(false);
                    return;
                }
                const editAccess = await isCollectorOrAdmin();
                setCanEdit(editAccess);
                const caseResponse = await getCaseById(caseId);
                const evidenceResponse = await getEvidences(caseId);
                if (caseResponse.status) {
                    setCaseDetails(caseResponse.caseDetails);
                } else {
                    setError(caseResponse.error || "Failed to fetch case details.");
                }
                if (evidenceResponse.status) {
                    setEvidences(evidenceResponse.evidences);
                    setFilteredEvidences(evidenceResponse.evidences);
                } else {
                    setError(evidenceResponse.error || "Failed to fetch evidences.");
                }
            } catch (err) {
                console.error(err);
                setError(err.message || "An unknown error occurred.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        const fetchOfficerName = async () => {
            if (officerNameRef.current) {
                const signerAddress = (await window.ethereum.request({ method: "eth_accounts" }))[0];
                const name = await getName(signerAddress);
                if (name) {
                    officerNameRef.current.value = name;
                }
            }
        };
        fetchOfficerName();
        getLocation();
    }, [caseId]);

    const getLocation = () => {
        if ("geolocation" in navigator && locationRef.current) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = `${position.coords.latitude}, ${position.coords.longitude}`;
                    locationRef.current.value = coords;
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        setFilteredEvidences(
            evidences.filter(
                (evidence) =>
                    evidence.evidenceId.toString().includes(query) ||
                    evidence.description.toLowerCase().includes(query)
            )
        );
    };

    const fetchAuditTrail = async (evidenceId) => {
        try {
            setAuditLoading(true);
            const response = await axios.get(`/api/auditTrail/${evidenceId}`);
            if (response.data.success) {
                setAuditTrail(response.data.data);
                openAuditModal();
            } else {
                toast({
                    title: "Audit trail not found.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (err) {
            console.error(err);
            toast({
                title: "Error fetching audit trail.",
                description: err.message || "An unknown error occurred.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setAuditLoading(false);
        }
    };

    const generateAIReport = async () => {
        try {
            openReportModal();
            const caseData = {
                caseDetails,
                evidences,
            };
            const aiResponse = await generateAIReportContent(caseData);
            setAiReport(aiResponse);
        } catch (err) {
            console.error(err);
            toast({
                title: "Error generating AI audit report.",
                description: err.message || "An unknown error occurred.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            onReportClose();
        }
    };

    const generateAIReportContent = async (data) => {
        const prompt = `You are an AI assistant tasked with generating a comprehensive audit report for a legal case to be presented in Indian courts. Use the provided case details and evidence data to create a formal report.
Case Details:
Court ID: ${data.caseDetails.courtId}
Case ID: ${data.caseDetails.caseId}
Case Description: ${data.caseDetails.caseDescription}
Case Type: ${data.caseDetails.caseType}
Petitioner: ${data.caseDetails.petitioner}
Respondent: ${data.caseDetails.respondent}
Status: ${data.caseDetails.status}
Start Date: ${data.caseDetails.startDateTime}
Submitted By: ${data.caseDetails.submittedBy}
Evidences:
${data.evidences
                .map(
                    (evidence) =>
                        `Evidence ID: ${evidence.evidenceId}
Description: ${evidence.description}
Officer Name: ${evidence.officerName}
Location: ${evidence.location}
Evidence Type: ${evidence.evidenceType}
Timestamp: ${new Date(evidence.timestamp * 1000).toLocaleString()}`
                )
                .join("\n")}
Instructions:
- Summarize the case and its significance.
- Detail each piece of evidence and its relevance.
- Present findings in a logical, clear, and concise manner.
- Use formal language suitable for a court presentation.
- Ensure the report is organized with headings and sections.`;
        const llm = new ChatGoogleGenerativeAI({
            model: "gemini-1.5-pro",
            temperature: 0,
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
        });
        const response = await llm.invoke([{ role: "user", content: prompt }]);
        const aiReportContent = response.content;
        if (!aiReportContent) {
            throw new Error("Failed to generate AI report.");
        }
        return aiReportContent;
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("AI Audit Report", 105, 20, { align: "center" });
        const lines = doc.splitTextToSize(aiReport, 180);
        doc.setFontSize(12);
        doc.text(lines, 15, 30);
        doc.save(`AI_Audit_Report_Case_${caseId}.pdf`);
    };

    // ******************** New Bubble Chart Code ********************
    // Build an array of events including the case registration and evidences.
    let bubbleEvents = [];
    if (caseDetails) {
        bubbleEvents.push({
            x: new Date(caseDetails.startDateTime),
            y: 1,
            r: 8,
            label: "Case Registered",
            type: "caseRegistered",
        });
    }
    if (evidences.length > 0) {
        // Group evidences by day to handle multiple events on the same date
        const grouped = {};
        evidences.forEach((evidence) => {
            const day = new Date(evidence.timestamp * 1000).toDateString();
            if (!grouped[day]) grouped[day] = [];
            grouped[day].push(evidence);
        });
        // Set a small offset to vertically jitter events on the same day
        const offset = 0.3;
        Object.keys(grouped).forEach((day) => {
            const eventsForDay = grouped[day];
            // Optional: sort events by timestamp
            eventsForDay.sort((a, b) => a.timestamp - b.timestamp);
            const n = eventsForDay.length;
            eventsForDay.forEach((evidence, index) => {
                const y = 1 + ((index - (n - 1) / 2) * offset);
                bubbleEvents.push({
                    x: new Date(evidence.timestamp * 1000),
                    y: y,
                    r: 8,
                    label: `Evidence ID: ${evidence.evidenceId}`,
                    description: evidence.description,
                    officerName: evidence.officerName,
                    location: evidence.location,
                    type: "evidence",
                });
            });
        });
    }
    const bubbleData = {
        datasets: [
            {
                label: "Case Timeline",
                data: bubbleEvents,
            },
        ],
    };

    const bubbleOptions = {
        scales: {
            x: {
                type: "time",
                time: {
                    unit: "day",
                },
                title: {
                    display: true,
                    text: "Date",
                },
            },
            y: {
                display: false, // Hide y-axis since it's used only for jittering.
            },
        },
        plugins: {
            colors: {
                forceOverride: true
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const dataPoint = context.raw;
                        if (dataPoint.type === "caseRegistered") {
                            return [
                                dataPoint.label,
                                `Date: ${new Date(dataPoint.x).toLocaleString()}`,
                            ];
                        }
                        return [
                            dataPoint.label,
                            `Description: ${dataPoint.description}`,
                            `Officer: ${dataPoint.officerName}`,
                            `Location: ${dataPoint.location}`,
                            `Date: ${new Date(dataPoint.x).toLocaleString()}`,
                        ];
                    },
                },
            },
            legend: {
                display: true,
            },
        },
    };

    // ******************** End Bubble Chart Code ********************

    const { mutateAsync: upload } = useStorageUpload();
    const uploadDataToIPFS = async () => {
        const uris = await upload({ data: file });
        return uris[0];
    };

    const handleAddEvidence = async () => {
        setIsSubmittingEvidence(true);
        try {
            if (
                !evidenceIdRef.current?.value ||
                !officerNameRef.current?.value ||
                !locationRef.current?.value ||
                !evidenceDescriptionRef.current?.value ||
                file.length === 0
            ) {
                toast({
                    title: "All fields are required.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                setIsSubmittingEvidence(false);
                return;
            }
            const evidenceId = parseInt(evidenceIdRef.current.value);
            if (isNaN(evidenceId) || evidenceId < 100000 || evidenceId > 999999) {
                toast({
                    title: "Invalid Evidence ID",
                    description: "Evidence ID must be a 6-digit number.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                setIsSubmittingEvidence(false);
                return;
            }
            let ipfsLink = await uploadDataToIPFS();
            ipfsLink = convertIPFSUriToUrl(ipfsLink);
            const response = await addEvidence(
                caseId,
                evidenceId,
                officerNameRef.current.value,
                locationRef.current.value,
                evidenceDescriptionRef.current.value,
                ipfsLink,
                evidenceType
            );
            if (response.status) {
                toast({
                    title: "Evidence submitted successfully.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                evidenceIdRef.current.value = "";
                evidenceDescriptionRef.current.value = "";
                setFile([]);
                setEvidenceType(0);
                const evidenceResponse = await getEvidences(caseId);
                if (evidenceResponse.status) {
                    setEvidences(evidenceResponse.evidences);
                    setFilteredEvidences(evidenceResponse.evidences);
                }
                onEvidenceClose();
            } else {
                toast({
                    title: "Failed to submit evidence.",
                    description: response.error || "An unknown error occurred.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (err) {
            console.error(err);
            toast({
                title: "Error",
                description: err.message || "An unknown error occurred.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsSubmittingEvidence(false);
        }
    };

    if (loading) {
        return (
            <Box className="min-h-screen flex justify-center items-center">
                <Spinner size="xl" />
            </Box>
        );
    }
    if (!hasAccess) {
        return (
            <Box className="min-h-screen flex justify-center items-center">
                <Alert status="error">
                    <AlertIcon />
                    {error || "You do not have permission to view this page."}
                </Alert>
            </Box>
        );
    }

    return (
        <Box className="min-h-screen pt-12 p-8 max-w-7xl mx-auto">
            <Heading as="h1" size="lg" mb={6}>
                Case Details (ID: {caseId})
            </Heading>
            <Box display="flex" flexDirection={["column", "column", "row"]} gap={6}>
                <Box flex="1" className='pr-4'>
                    {caseDetails && (
                        <>
                            <Text>
                                <strong>Court ID:</strong> {caseDetails.courtId}
                            </Text>
                            <Text>
                                <strong>Case Description:</strong> {caseDetails.caseDescription}
                            </Text>
                            <Text>
                                <strong>Case Type:</strong> {caseDetails.caseType}
                            </Text>
                            <Text>
                                <strong>Petitioner:</strong> {caseDetails.petitioner}
                            </Text>
                            <Text>
                                <strong>Respondent:</strong> {caseDetails.respondent}
                            </Text>
                            <Text>
                                <strong>Status:</strong> {caseDetails.status}
                            </Text>
                            <Text>
                                <strong>Start Date:</strong>{" "}
                                {new Date(caseDetails.startDateTime).toLocaleDateString()}
                            </Text>
                            <Text>
                                <strong>Submitted By:</strong> {caseDetails.submittedBy}
                            </Text>
                        </>
                    )}
                    <Button colorScheme="teal" mt={4} onClick={generateAIReport}>
                        Generate AI Audit Report
                    </Button>
                    {canEdit && (
                        <Button colorScheme="teal" mt={4} ml={2} onClick={openEvidenceModal}>
                            + Add Evidence
                        </Button>
                    )}
                </Box>
                <Box flex="1">
                    <Heading as="h2" size="md" mb={4}>
                        Case Timeline
                    </Heading>
                    {bubbleEvents.length > 0 ? (
                        <Chart type="bubble" data={bubbleData} options={bubbleOptions} />
                    ) : (
                        <Text>No evidences to display in the timeline.</Text>
                    )}
                </Box>
            </Box>
            <Box mt={8}>
                <Heading as="h2" size="md" mb={4}>
                    Evidences
                </Heading>
                <Input
                    placeholder="Search evidences by ID or description..."
                    value={searchQuery}
                    onChange={handleSearch}
                    mb={4}
                    className="mb-4 w-full px-4 py-2 shadow-md rounded transition duration-200 ease-in-out hover:shadow-lg hover:border-blue-500"
                />
                {filteredEvidences.length > 0 ? (
                    <VStack spacing={4} align="stretch">
                        {filteredEvidences.map((evidence, index) => (
                            <Box
                                key={index}
                                p={4}
                                borderWidth="1px"
                                borderRadius="md"
                                _hover={{ bg: "gray.50" }}
                            >
                                <Text>
                                    <strong>Evidence ID:</strong> {evidence.evidenceId}
                                </Text>
                                <Text>
                                    <strong>Description:</strong> {evidence.description}
                                </Text>
                                <Text>
                                    <strong>Date:</strong> {new Date(evidence.timestamp * 1000).toLocaleString()}
                                </Text>
                                <Text>
                                    <strong>Officer Name:</strong> {evidence.officerName}
                                </Text>
                                <Text>
                                    <strong>Location:</strong> {evidence.location}
                                </Text>
                                <Text>
                                    <strong>File Hash URL:</strong>{" "}
                                    <a href={evidence.fileHash} target="_blank" rel="noopener noreferrer">
                                        {evidence.fileHash}
                                    </a>
                                </Text>
                                <Text>
                                    <strong>Submitted By:</strong> {evidence.owner}
                                </Text>
                                <HStack spacing={4} justify="flex-end" mt={2}>
                                    <Button
                                        onClick={() => fetchAuditTrail(evidence.evidenceId)}
                                        colorScheme="blue"
                                    >
                                        View Audit Trail
                                    </Button>
                                    <Button
                                        as="a"
                                        href={evidence.fileHash}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        colorScheme="teal"
                                    >
                                        Download Evidence
                                    </Button>
                                </HStack>
                            </Box>
                        ))}
                    </VStack>
                ) : (
                    <Text>No evidences found.</Text>
                )}
            </Box>

            {/* Evidence Modal */}
            <Modal isOpen={isEvidenceOpen} onClose={onEvidenceClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add Evidence</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl id="evidenceId" mb={4} isRequired>
                            <FormLabel>Evidence ID (6-digit number)</FormLabel>
                            <Input placeholder="Enter evidence ID" ref={evidenceIdRef} />
                        </FormControl>
                        <FormControl id="officerName" mb={4} isRequired>
                            <FormLabel>Officer Name</FormLabel>
                            <Input placeholder="Enter officer name" ref={officerNameRef} />
                        </FormControl>
                        <FormControl id="location" mb={4} isRequired>
                            <FormLabel>Location</FormLabel>
                            <Input placeholder="Enter location" ref={locationRef} />
                        </FormControl>
                        <FormControl id="evidenceType" mb={4} isRequired>
                            <FormLabel>Evidence Type</FormLabel>
                            <Select
                                placeholder="Select evidence type"
                                value={evidenceType.toString()}
                                onChange={(e) => setEvidenceType(Number(e.target.value))}
                            >
                                <option value="0">Forensic Evidence</option>
                                <option value="1">Computer-Based Evidence</option>
                                <option value="2">Network & Internet-Based Evidence</option>
                                <option value="3">Social Media & Communication Evidence</option>
                                <option value="4">Mobile Device Evidence (GPS Data)</option>
                                <option value="5">Cybercrime Evidence</option>
                                <option value="6">Surveillance & IoT Data</option>
                                <option value="7">Financial & Transactional Evidence</option>
                            </Select>
                        </FormControl>
                        <FormControl id="evidenceDescription" mb={4} isRequired>
                            <FormLabel>Evidence Description</FormLabel>
                            <Textarea placeholder="Enter evidence description" ref={evidenceDescriptionRef} />
                        </FormControl>
                        <FormControl id="file" mb={6} isRequired>
                            <FormLabel>Upload Evidence File</FormLabel>
                            <Input
                                type="file"
                                accept=""
                                onChange={(e) => setFile(e.target.files ? Array.from(e.target.files) : [])}
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="teal" isLoading={isSubmittingEvidence} onClick={handleAddEvidence}>
                            Submit Evidence
                        </Button>
                        <Button variant="ghost" onClick={onEvidenceClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Audit Trail Modal */}
            <Modal isOpen={isAuditOpen} onClose={onAuditClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Audit Trail</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {auditLoading ? (
                            <Spinner />
                        ) : auditTrail ? (
                            <Box>
                                <Text>
                                    <strong>Evidence ID:</strong> {auditTrail.evidenceId}
                                </Text>
                                <VStack spacing={3} align="stretch" mt={4}>
                                    {auditTrail.actions.map((action, index) => (
                                        <Box key={index} p={3} borderWidth="1px" borderRadius="md">
                                            <Text>
                                                <strong>Action Type:</strong> {action.actionType}
                                            </Text>
                                            <Text>
                                                <strong>User Address:</strong> {action.userAddress}
                                            </Text>
                                            <Text>
                                                <strong>Timestamp:</strong> {new Date(action.timestamp).toLocaleString()}
                                            </Text>
                                            <Text>
                                                <strong>Details:</strong> {action.details}
                                            </Text>
                                            <Text>
                                                <strong>TransactionHash:</strong> {action.transactionHash}
                                            </Text>
                                            <Text>
                                                <strong>Block Number:</strong> {action.blockNumber}
                                            </Text>
                                        </Box>
                                    ))}
                                </VStack>
                            </Box>
                        ) : (
                            <Text>No audit trail available.</Text>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* AI Audit Report Modal */}
            <Modal isOpen={isReportOpen} onClose={onReportClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>AI Audit Report</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {aiReport ? (
                            <Box>
                                <Text whiteSpace="pre-wrap">{aiReport}</Text>
                            </Box>
                        ) : (
                            <Spinner />
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="teal" onClick={downloadPDF} mr={3}>
                            Download PDF
                        </Button>
                        <Button variant="ghost" onClick={onReportClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
