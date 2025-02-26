"use client";
import { useEffect, useState, useRef } from "react";
import {
    Box,
    Heading,
    Text,
    VStack,
    Spinner,
    Alert,
    AlertIcon,
    Card,
    CardHeader,
    CardBody,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    useDisclosure,
    useToast,
    Select,
    Link,
    Icon,
} from "@chakra-ui/react";
import { getCaseById, getEvidences, addEvidence, convertIPFSUriToUrl } from "@/utils/helpers";
import { useStorageUpload } from "@thirdweb-dev/react";
import { useRouter } from "next/navigation";
import { FiDownload } from "react-icons/fi";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function CaseDetails({ params }: { params: { caseId: string } }) {
    const router = useRouter();
    const { caseId } = params;
    const [caseDetails, setCaseDetails] = useState<any>(null);
    const [evidences, setEvidences] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isSubmittingEvidence, setIsSubmittingEvidence] = useState<boolean>(false);
    const [file, setFile] = useState<File[]>([]);
    const { mutateAsync: upload } = useStorageUpload();
    const evidenceDescriptionRef = useRef<HTMLTextAreaElement>(null);
    const toast = useToast();

    // State for evidence type (0-7)
    const [evidenceType, setEvidenceType] = useState<number>(0);

    useEffect(() => {
        const fetchCaseDetails = async () => {
            try {
                const caseResponse = await getCaseById(caseId);
                const evidenceResponse = await getEvidences(caseId);
                if (caseResponse.status) {
                    setCaseDetails(caseResponse.caseDetails);
                } else {
                    setError(caseResponse.error || "Failed to fetch case details.");
                }
                if (evidenceResponse.status) {
                    setEvidences(evidenceResponse.evidences);
                } else {
                    setError(evidenceResponse.error || "Failed to fetch evidences.");
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message || "An unknown error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchCaseDetails();
    }, [caseId]);

    const uploadDataToIPFS = async (): Promise<string> => {
        const uris = await upload({ data: file });
        return uris[0];
    };

    const handleAddEvidence = async () => {
        setIsSubmittingEvidence(true);
        try {
            if (!evidenceDescriptionRef.current?.value || file.length === 0) {
                toast({
                    title: "All fields are required.",
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
                evidenceDescriptionRef.current.value,
                ipfsLink,
                evidenceType
            );
            if (response.status) {
                toast({
                    title: "Evidence uploaded successfully.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                evidenceDescriptionRef.current.value = "";
                setFile([]);
                onClose();
                const evidenceResponse = await getEvidences(caseId);
                if (evidenceResponse.status) {
                    setEvidences(evidenceResponse.evidences);
                }
            } else {
                toast({
                    title: "Failed to upload evidence.",
                    description: response.error || "An unknown error occurred.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (err: any) {
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

    // We'll use a simple download link for non-image evidences.
    const renderEvidenceContent = (evidence: any) => {
        const fileUrl = evidence.fileHash;
        const fileName = fileUrl.split("/").pop() || "File";
        return (
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Text>{fileName}</Text>
                <Link href={fileUrl} isExternal color="teal.500" download>
                    <Button leftIcon={<FiDownload />} variant="outline">
                        Download
                    </Button>
                </Link>
            </Box>
        );
    };

    if (loading) {
        return (
            <Box className="min-h-screen flex justify-center items-center">
                <Spinner size="xl" />
            </Box>
        );
    }

    if (error) {
        return (
            <Box className="min-h-screen flex justify-center items-center">
                <Alert status="error">
                    <AlertIcon />
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Box className="min-h-screen p-6 max-w-4xl mx-auto">
            <Heading as="h1" size="lg" mb={6}>
                Case Details (ID: {caseId})
            </Heading>
            {caseDetails && (
                <>
                    <Text><strong>Court ID:</strong> {caseDetails.courtId}</Text>
                    <Text><strong>Case Description:</strong> {caseDetails.caseDescription}</Text>
                    <Text><strong>Case Type:</strong> {caseDetails.caseType}</Text>
                    <Text><strong>Petitioner:</strong> {caseDetails.petitioner}</Text>
                    <Text><strong>Respondent:</strong> {caseDetails.respondent}</Text>
                    <Text><strong>Status:</strong> {caseDetails.status}</Text>
                    <Text><strong>Start Date:</strong> {caseDetails.startDateTime}</Text>
                    <Text><strong>Submitted By:</strong> {caseDetails.submittedBy}</Text>
                </>
            )}

            <Box mt={8} mb={4} display="flex" justifyContent="space-between" alignItems="center">
                <Heading as="h2" size="md">
                    Evidence Timeline
                </Heading>
                <Button colorScheme="teal" onClick={onOpen}>
                    + Add Evidence
                </Button>
            </Box>

            {evidences.length > 0 ? (
                <VStack spacing={6} align="stretch">
                    {evidences.map((evidence, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <Text><strong>Description:</strong> {evidence.description}</Text>
                                <Text>
                                    <strong>Date:</strong>{" "}
                                    {new Date(evidence.timestamp * 1000).toLocaleString()}
                                </Text>
                                <Text wordBreak="break-all">
                                    <strong>File Hash:</strong> {evidence.fileHash}
                                </Text>
                                <Text>
                                    <strong>Evidence Type:</strong> {evidence.evidenceType}
                                </Text>
                            </CardHeader>
                            <CardBody>{renderEvidenceContent(evidence)}</CardBody>
                        </Card>
                    ))}
                </VStack>
            ) : (
                <Text>No evidences found for this case.</Text>
            )}

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Submit Evidence</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl id="evidenceDescription" mb={4} isRequired>
                            <FormLabel>Evidence Description</FormLabel>
                            <Textarea placeholder="Enter evidence description" ref={evidenceDescriptionRef} />
                        </FormControl>
                        <FormControl id="evidenceType" mb={4} isRequired>
                            <FormLabel>Evidence Type</FormLabel>
                            <Select
                                placeholder="Select evidence type"
                                value={evidenceType.toString()}
                                onChange={(e) => setEvidenceType(Number(e.target.value))}
                            >
                                <option value="0">Forensic Evidence</option>
                                <option value="1">Computer‑Based Evidence</option>
                                <option value="2">Network & Internet‑Based Evidence</option>
                                <option value="3">Social Media & Communication Evidence</option>
                                <option value="4">Mobile Device Evidence (GPS Data)</option>
                                <option value="5">Cybercrime Evidence</option>
                                <option value="6">Surveillance & IoT Data</option>
                                <option value="7">Financial & Transactional Evidence</option>
                            </Select>
                        </FormControl>
                        <FormControl id="file" mb={6} isRequired>
                            <FormLabel>Upload Evidence File</FormLabel>
                            <Input
                                type="file"
                                accept="*"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setFile(e.target.files ? Array.from(e.target.files) : [])
                                }
                            />
                        </FormControl>
                        <Button
                            colorScheme="teal"
                            isLoading={isSubmittingEvidence}
                            onClick={handleAddEvidence}
                            width="full"
                            mb={4}
                        >
                            Submit Evidence
                        </Button>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
}
