"use client";
import { useRef, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Heading,
  useToast,
  Select,
} from "@chakra-ui/react";
import { addCase } from "@/utils/helpers";

export default function RegisterCase() {
  const courtIdRef = useRef<HTMLInputElement>(null);
  const caseDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const caseTypeRef = useRef<HTMLSelectElement>(null);
  const petitionerRef = useRef<HTMLInputElement>(null);
  const respondentRef = useRef<HTMLInputElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const toast = useToast();

  const handleAddCase = async () => {
    setIsLoading(true);

    try {
      if (
        !courtIdRef.current?.value ||
        !caseDescriptionRef.current?.value ||
        !caseTypeRef.current?.value ||
        !petitionerRef.current?.value ||
        !respondentRef.current?.value ||
        !startDateRef.current?.value ||
        !statusRef.current?.value
      ) {
        toast({
          title: "All fields are required.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      const response = await addCase(
        courtIdRef.current.value,
        caseDescriptionRef.current.value,
        caseTypeRef.current.value,
        petitionerRef.current.value,
        respondentRef.current.value,
        startDateRef.current.value,
        statusRef.current.value
      );

      if (response.status) {
        toast({
          title: `Case registered successfully with Case ID: ${response.newCaseId}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        // Reset form fields
        courtIdRef.current.value = "";
        caseDescriptionRef.current.value = "";
        petitionerRef.current.value = "";
        respondentRef.current.value = "";
        startDateRef.current.value = "";
      } else {
        toast({
          title: "Failed to register case.",
          description: "You are not permitted to register cases, contact the Admin.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "An unknown error occurred.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="min-h-screen flex justify-center items-center p-6">
      <Box maxW="600px" w="100%">
        <Heading as="h1" size="lg" mb={6}>
          Register Case
        </Heading>
        <FormControl id="courtId" mb={4} isRequired>
          <FormLabel>Court ID</FormLabel>
          <Input placeholder="Enter court ID" ref={courtIdRef} />
        </FormControl>

        <FormControl id="caseDescription" mb={4} isRequired>
          <FormLabel>Case Description</FormLabel>
          <Textarea placeholder="Enter case description" ref={caseDescriptionRef} />
        </FormControl>

        <FormControl id="caseType" mb={4} isRequired>
          <FormLabel>Case Type</FormLabel>
          <Select placeholder="Select case type" ref={caseTypeRef}>
            <option value="Civil">Civil</option>
            <option value="Criminal">Criminal</option>
            <option value="Family">Family</option>
            {/* Add more options as needed */}
          </Select>
        </FormControl>

        <FormControl id="petitioner" mb={4} isRequired>
          <FormLabel>Petitioner</FormLabel>
          <Input placeholder="Enter petitioner name" ref={petitionerRef} />
        </FormControl>

        <FormControl id="respondent" mb={4} isRequired>
          <FormLabel>Respondent</FormLabel>
          <Input placeholder="Enter respondent name" ref={respondentRef} />
        </FormControl>

        <FormControl id="startDateTime" mb={4} isRequired>
          <FormLabel>Start Date</FormLabel>
          <Input type="date" ref={startDateRef} />
        </FormControl>

        <FormControl id="status" mb={6} isRequired>
          <FormLabel>Status</FormLabel>
          <Select placeholder="Select status" ref={statusRef}>
            <option value="Pending">Pending</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Closed">Closed</option>
            {/* Add more options as needed */}
          </Select>
        </FormControl>

        <Button
          colorScheme="teal"
          isLoading={isLoading}
          onClick={handleAddCase}
          width="full"
        >
          Register Case
        </Button>
      </Box>
    </Box>
  );
}
