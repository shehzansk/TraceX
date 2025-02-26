"use client";
import { useEffect, useState, useRef } from "react";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Heading,
    useToast,
    Alert,
    AlertIcon,
    Spinner,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { addMember, getAdmin } from "@/utils/helpers";
import { useRouter } from "next/navigation";

export default function AdminPage() {
    const [currentAccount, setCurrentAccount] = useState<string>("");
    const [adminAddress, setAdminAddress] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const memberAddressRef = useRef<HTMLInputElement>(null);
    const toast = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchAccounts = async () => {
            if (typeof window !== "undefined" && (window as any).ethereum) {
                const provider = new ethers.providers.Web3Provider((window as any).ethereum);
                await provider.send("eth_requestAccounts", []);
                const signer = provider.getSigner();
                const userAddress = await signer.getAddress();
                setCurrentAccount(userAddress);
                try {
                    const adminAddr = await getAdmin();
                    setAdminAddress(adminAddr);
                } catch (error: any) {
                    toast({
                        title: "Error fetching admin address",
                        description: error.message || "An unknown error occurred.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            }
            setLoading(false);
        };

        fetchAccounts();
    }, [toast]);

    const handleAddMember = async () => {
        setIsAdding(true);
        try {
            if (!memberAddressRef.current?.value) {
                toast({
                    title: "Member address is required.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                setIsAdding(false);
                return;
            }
            const response = await addMember(memberAddressRef.current.value);
            if (response.status) {
                toast({
                    title: "Member added successfully.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                memberAddressRef.current.value = "";
            } else {
                toast({
                    title: "Failed to add member.",
                    description: response.error || "An unknown error occurred.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: error.message || "An unknown error occurred.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsAdding(false);
        }
    };

    if (loading) {
        return (
            <Box className="min-h-screen flex justify-center items-center">
                <Spinner size="xl" />
            </Box>
        );
    }

    // Only allow access if the connected account is the admin (case-insensitive check)
    if (currentAccount.toLowerCase() !== adminAddress.toLowerCase()) {
        return (
            <Box className="min-h-screen flex justify-center items-center">
                <Alert status="error">
                    <AlertIcon />
                    You are not authorized to view this page.
                </Alert>
            </Box>
        );
    }

    return (
        <Box className="min-h-screen p-6 max-w-4xl mx-auto">
            <Heading as="h1" size="lg" mb={6}>
                Admin Dashboard
            </Heading>
            <FormControl id="memberAddress" mb={4} isRequired>
                <FormLabel>New Member Address</FormLabel>
                <Input placeholder="Enter member address" ref={memberAddressRef} />
            </FormControl>
            <Button colorScheme="teal" isLoading={isAdding} onClick={handleAddMember}>
                Add Member
            </Button>
        </Box>
    );
}
