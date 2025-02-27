// app/admin/page.tsx

"use client";
import { useEffect, useState, useRef } from "react";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Heading,
    Select,
    useToast,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Alert,
    AlertIcon,
    Spinner,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from "@chakra-ui/react";
import {
    getAllMembers,
    addMember,
    changeRole,
    getRole,
} from "@/utils/helpers";

export default function AdminPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [newMemberAddress, setNewMemberAddress] = useState<string>("");
    const [newMemberName, setNewMemberName] = useState<string>("");
    const [newMemberRole, setNewMemberRole] = useState<string>("None");
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [selectedRole, setSelectedRole] = useState<string>("None");
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await getAllMembers();
                if (response.status) {
                    setMembers(response.members);
                } else {
                    setError(response.error || "Failed to fetch members.");
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message || "An unknown error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    const handleAddMember = async () => {
        if (!newMemberAddress || !newMemberName || newMemberRole === "None") {
            toast({
                title: "All fields are required.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        try {
            const response = await addMember(newMemberAddress, newMemberName, parseInt(newMemberRole));
            if (response.status) {
                toast({
                    title: "Member added successfully.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                // Refresh the members list
                const fetchMembers = async () => {
                    const response = await getAllMembers();
                    if (response.status) {
                        setMembers(response.members);
                    } else {
                        setError(response.error || "Failed to fetch members.");
                    }
                };
                fetchMembers();
                setNewMemberAddress("");
                setNewMemberName("");
                setNewMemberRole("None");
            } else {
                toast({
                    title: "Failed to add member.",
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

    const handleOpenChangeRoleModal = (member: any) => {
        setSelectedMember(member);
        setSelectedRole(member.role.toString());
        onOpen();
    };

    const handleChangeRole = async () => {
        if (!selectedMember || selectedRole === "None") {
            toast({
                title: "Role selection is required.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        try {
            const response = await changeRole(selectedMember.address, parseInt(selectedRole));
            if (response.status) {
                toast({
                    title: "Role updated successfully.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                // Update the local state
                setMembers((prevMembers) =>
                    prevMembers.map((m) =>
                        m.address === selectedMember.address ? { ...m, role: selectedRole } : m
                    )
                );
                onClose();
            } else {
                toast({
                    title: "Failed to update role.",
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
                Admin Dashboard
            </Heading>
            <Box mb={6}>
                <Heading as="h2" size="md" mb={4}>
                    Add New Member
                </Heading>
                <FormControl id="newMemberAddress" mb={4} isRequired>
                    <FormLabel>Address</FormLabel>
                    <Input
                        placeholder="Enter member address"
                        value={newMemberAddress}
                        onChange={(e) => setNewMemberAddress(e.target.value)}
                    />
                </FormControl>
                <FormControl id="newMemberName" mb={4} isRequired>
                    <FormLabel>Name</FormLabel>
                    <Input
                        placeholder="Enter member name"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                    />
                </FormControl>
                <FormControl id="newMemberRole" mb={4} isRequired>
                    <FormLabel>Role</FormLabel>
                    <Select
                        placeholder="Select role"
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value)}
                    >
                        <option value="1">Admin</option>
                        <option value="2">Collector</option>
                        <option value="3">Analyst</option>
                    </Select>
                </FormControl>
                <Button colorScheme="teal" onClick={handleAddMember}>
                    Add Member
                </Button>
            </Box>

            <Heading as="h2" size="md" mb={4}>
                Members List
            </Heading>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Address</Th>
                        <Th>Name</Th>
                        <Th>Role</Th>
                        <Th>Action</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {members.map((member, index) => (
                        <Tr key={index}>
                            <Td>{member.address}</Td>
                            <Td>{member.name}</Td>
                            <Td>{member.role === 1 ? 'Admin' : member.role === 2 ? 'Collector' : 'Analyst'}</Td>
                            <Td>
                                <Button
                                    colorScheme="blue"
                                    size="sm"
                                    onClick={() => handleOpenChangeRoleModal(member)}
                                >
                                    Change Role
                                </Button>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            {/* Change Role Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="md">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Change Role</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl id="selectedRole" mb={4} isRequired>
                            <FormLabel>Role</FormLabel>
                            <Select
                                placeholder="Select role"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                            >
                                <option value="1">Admin</option>
                                <option value="2">Collector</option>
                                <option value="3">Analyst</option>
                            </Select>
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="teal" onClick={handleChangeRole}>
                            Update Role
                        </Button>
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}