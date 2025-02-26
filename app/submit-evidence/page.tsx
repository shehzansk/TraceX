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
import { addEvidence, convertIPFSUriToUrl } from "@/utils/helpers";
import { useStorageUpload } from "@thirdweb-dev/react";

export default function SubmitEvidence() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File[]>([]);
  const [evidenceType, setEvidenceType] = useState<number>(0); // default evidence type (Forensic Evidence)
  const { mutateAsync: upload } = useStorageUpload();
  const toast = useToast();

  const caseIdRef = useRef<HTMLInputElement>(null);
  const evidenceDescriptionRef = useRef<HTMLTextAreaElement>(null);

  const uploadDataToIPFS = async (): Promise<string> => {
    const uris = await upload({ data: file });
    return uris[0];
  };

  const handleAddEvidence = async () => {
    setIsLoading(true);

    try {
      if (
        !caseIdRef.current?.value ||
        !evidenceDescriptionRef.current?.value ||
        file.length === 0
      ) {
        toast({
          title: "All fields are required.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      let ipfsLink = await uploadDataToIPFS();
      ipfsLink = convertIPFSUriToUrl(ipfsLink);

      // Note: Pass the evidenceType value (converted to number) to the helper function.
      const response = await addEvidence(
        caseIdRef.current.value,
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
        // Reset form fields
        caseIdRef.current.value = "";
        evidenceDescriptionRef.current.value = "";
        setFile([]);
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
      setIsLoading(false);
    }
  };

  return (
    <Box className="min-h-screen flex justify-center items-center p-6">
      <Box maxW="600px" w="100%">
        <Heading as="h1" size="lg" mb={6}>
          Submit Evidence
        </Heading>
        <FormControl id="caseId" mb={4} isRequired>
          <FormLabel>Case ID</FormLabel>
          <Input placeholder="Enter case ID" ref={caseIdRef} />
        </FormControl>

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
          isLoading={isLoading}
          onClick={handleAddEvidence}
          width="full"
        >
          Submit Evidence
        </Button>
      </Box>
    </Box>
  );
}
