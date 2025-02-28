// app/cases/page.tsx

"use client";
import { useEffect, useState } from "react";
import {
    Box,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Button,
    Alert,
    AlertIcon,
    Spinner,
    Input,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Select,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import {
    getAllCases,
    changeCaseStatus,
    isAtLeastAnalyst,
    isCollectorOrAdmin,
    getCaseById,
} from "@/utils/helpers";
import { ethers } from "ethers";

export default function CasesList() {
    const [cases, setCases] = useState<any[]>([]);
    const [filteredCases, setFilteredCases] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [hasAccess, setHasAccess] = useState<boolean>(false);
    const [canEdit, setCanEdit] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
    const [newStatus, setNewStatus] = useState<string>("");
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchCases = async () => {
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

                const response = await getAllCases();

                if (response.status) {
                    setCases(response.cases);
                    setFilteredCases(response.cases);
                } else {
                    setError(response.error || "Failed to fetch cases.");
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message || "An unknown error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchCases();
    }, []);

    const handleViewCase = (caseId: number) => {
        router.push(`/cases/${caseId}`);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        setFilteredCases(
            cases.filter((caseItem) =>
                caseItem.caseDescription.toLowerCase().includes(query)
            )
        );
    };

    const handleChangeStatus = (caseId: number) => {
        setSelectedCaseId(caseId);
        onOpen();
    };

    const handleStatusUpdate = async () => {
        if (!newStatus) {
            toast({
                title: "Please select a new status.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        try {
            const response = await changeCaseStatus(selectedCaseId!.toString(), newStatus);
            if (response.status) {
                toast({
                    title: "Case status updated successfully.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                // Update the case status locally
                const updatedCases = cases.map((caseItem) =>
                    caseItem.caseId === selectedCaseId
                        ? { ...caseItem, status: newStatus }
                        : caseItem
                );
                setCases(updatedCases);
                setFilteredCases(updatedCases.filter((caseItem) =>
                    caseItem.caseDescription.toLowerCase().includes(searchQuery)
                ));
                setNewStatus("");
                setSelectedCaseId(null);
                onClose();
            } else {
                toast({
                    title: "Failed to update case status.",
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

    if (cases.length === 0) {
        return (
            <Box className="min-h-screen flex flex-col justify-center items-center">
                <Heading as="h2" size="md">
                    No cases registered yet.
                </Heading>
            </Box>
        );
    }

    return (
        <Box className="min-h-screen p-7 max-w-7xl mx-auto">
            <Heading as="h1" size="lg" mb={6}>
                Registered Cases
            </Heading>
            <Input
                placeholder="Search cases by description..."
                value={searchQuery}
                onChange={handleSearch}
                className="mb-4 w-full px-4 py-2 shadow-md rounded transition duration-200 ease-in-out hover:shadow-lg hover:border-blue-500"
            />

            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Case ID</Th>
                        <Th>Court ID</Th>
                        <Th>Case Type</Th>
                        <Th>CaseDescription</Th>
                        <Th>Status</Th>
                        <Th>Submitted By</Th>
                        <Th>Action</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {filteredCases.map((caseItem, index) => (
                        <Tr key={index}>
                            <Td>{caseItem.caseId}</Td>
                            <Td>{caseItem.courtId}</Td>
                            <Td>{caseItem.caseType}</Td>
                            <Td>{caseItem.caseDescription.split(" ").slice(0, 5).join(" ")}...</Td>
                            <Td>{caseItem.status}</Td>
                            <Td>{caseItem.submittedBy}</Td>
                            <Td>
                                <Button
                                    colorScheme="teal"
                                    size="sm"
                                    mr={2}
                                    onClick={() => handleViewCase(caseItem.caseId)}
                                >
                                    View Details
                                </Button>
                                {canEdit && (
                                    <Button
                                        colorScheme="orange"
                                        size="sm"
                                        onClick={() => handleChangeStatus(caseItem.caseId)}
                                    >
                                        Change Status
                                    </Button>
                                )}
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            {/* Change Status Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Change Case Status</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl id="newStatus" mb={4} isRequired>
                            <FormLabel>New Status</FormLabel>
                            <Select
                                placeholder="Select new status"
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                            >
                                <option value="Open">Open</option>
                                <option value="Under Investigation">Under Investigation</option>
                                <option value="Closed">Closed</option>
                                {/* Add more options as needed */}
                            </Select>
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="teal" mr={3} onClick={handleStatusUpdate}>
                            Update Status
                        </Button>
                        <Button variant="ghost" onClick={() => { onClose(); setNewStatus(""); }}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
