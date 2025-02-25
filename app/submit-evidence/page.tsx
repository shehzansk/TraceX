// app/submit-evidence/page.tsx

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
} from "@chakra-ui/react";
import { addEvidence, convertIPFSUriToUrl } from "@/utils/helpers";
import { useStorageUpload } from "@thirdweb-dev/react";

export default function SubmitEvidence() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File[]>([]);
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

      const response = await addEvidence(
        caseIdRef.current.value,
        evidenceDescriptionRef.current.value,
        ipfsLink
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
          <Textarea
            placeholder="Enter evidence description"
            ref={evidenceDescriptionRef}
          />
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
