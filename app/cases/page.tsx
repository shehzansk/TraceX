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
    Text,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { getAllCases, isMember, initializeProvider } from "@/utils/helpers";
import { ethers } from "ethers";

export default function CasesList() {
    const [cases, setCases] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const router = useRouter();

    useEffect(() => {
        const fetchCases = async () => {
            try {
                // Check MetaMask availability
                if (typeof window === "undefined" || !(window as any).ethereum) {
                    setError("Please install MetaMask to use this application.");
                    setLoading(false);
                    return;
                }

                // Create a local provider to get current account
                const localProvider = new ethers.providers.Web3Provider(window.ethereum);
                await localProvider.send("eth_requestAccounts", []);
                const signer = localProvider.getSigner();
                const userAddress = await signer.getAddress();

                // Check if the user is a member (or admin) using the helper
                const member = await isMember(userAddress);
                if (!member) {
                    setError(
                        "You are not allowed to see cases in this chain, ask the admin for permissions."
                    );
                    setLoading(false);
                    return;
                }

                // Once confirmed as a member, retrieve all cases
                const response = await getAllCases();
                if (response.status) {
                    setCases(response.cases);
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
                    <Text>{error}</Text>
                </Alert>
            </Box>
        );
    }

    if (cases.length === 0) {
        return (
            <Box className="min-h-screen flex justify-center items-center">
                <Heading as="h2" size="md">
                    No cases registered yet.
                </Heading>
            </Box>
        );
    }

    return (
        <Box className="min-h-screen p-6 max-w-4xl mx-auto">
            <Heading as="h1" size="lg" mb={6}>
                Registered Cases
            </Heading>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Case ID</Th>
                        <Th>Court ID</Th>
                        <Th>Case Type</Th>
                        <Th>Status</Th>
                        <Th>Submitted By</Th>
                        <Th>Action</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {cases.map((caseItem, index) => (
                        <Tr key={index}>
                            <Td>{caseItem.caseId}</Td>
                            <Td>{caseItem.courtId}</Td>
                            <Td>{caseItem.caseType}</Td>
                            <Td>{caseItem.status}</Td>
                            <Td>{caseItem.submittedBy}</Td>
                            <Td>
                                <Button
                                    colorScheme="teal"
                                    size="sm"
                                    onClick={() => handleViewCase(caseItem.caseId)}
                                >
                                    View Details
                                </Button>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
}
