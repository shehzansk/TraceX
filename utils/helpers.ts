// helpers.ts

import { CONTRACT_ADDRESS } from "@/const/value";
import { abi } from "@/const/contract-abi";
import { ethers, utils } from "ethers";

let provider: ethers.providers.Web3Provider | null = null;
let contract: ethers.Contract | null = null;

/**
 * Initializes the Ethereum provider, contract, and signer.
 * This function should only be called on the client side.
 */
export const initializeProvider = () => {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    provider = new ethers.providers.Web3Provider(
      (window as any).ethereum as ethers.providers.ExternalProvider
    );
    contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
  } else {
    console.log("Please install MetaMask to use this application!");
    throw new Error("MetaMask not installed");
  }
};

export const addCase = async (
  courtId: string,
  caseDescription: string,
  caseType: string,
  petitioner: string,
  respondent: string,
  startDateTime: string,
  status: string
) => {
  try {
    if (!provider || !contract) {
      initializeProvider();
    }

    const signer = provider!.getSigner();
    const contractWithSigner = contract!.connect(signer);

    const totalCases = await contractWithSigner.totalCases();
    const tx = await contractWithSigner.registerCase(
      courtId,
      caseDescription,
      caseType,
      petitioner,
      respondent,
      startDateTime,
      status
    );
    await tx.wait();
    return { newCaseId: totalCases.toNumber() + 1, status: true };
  } catch (err: any) {
    console.error(err);
    return { status: false, error: err.message };
  }
};

export const addEvidence = async (
  caseId: string,
  evidenceDescription: string,
  fileUrl: string
) => {
  try {
    if (!provider || !contract) {
      initializeProvider();
    }

    const signer = provider!.getSigner();
    const contractWithSigner = contract!.connect(signer);

    const tx = await contractWithSigner.registerEvidence(
      caseId,
      evidenceDescription,
      fileUrl
    );
    await tx.wait();
    return { status: true };
  } catch (err: any) {
    console.error(err);
    return { status: false, error: err.message };
  }
};

export const getAllCases = async () => {
  try {
    if (!provider || !contract) {
      initializeProvider();
    }

    const caseIds = await contract!.getAllCaseIds();
    const cases = [];
    for (let i = 0; i < caseIds.length; i++) {
      const caseId = caseIds[i].toNumber();
      const caseDetails = await contract!.getCaseById(caseId);
      cases.push({
        courtId: caseDetails[0],
        caseId: caseDetails[1].toNumber(),
        caseDescription: caseDetails[2],
        caseType: caseDetails[3],
        petitioner: caseDetails[4],
        respondent: caseDetails[5],
        startDateTime: caseDetails[6],
        status: caseDetails[7],
        totalEvidences: caseDetails[8].toNumber(),
      });
    }
    return { cases, status: true };
  } catch (err: any) {
    console.error(err);
    return { status: false, error: err.message };
  }
};

export const getEvidences = async (caseId: string) => {
  try {
    if (!provider || !contract) {
      initializeProvider();
    }

    const caseDetails = await contract!.getCaseById(caseId);
    const totalEvidences = caseDetails[8].toNumber();
    const evidences = [];
    for (let j = 1; j <= totalEvidences; j++) {
      const evidenceDetails = await contract!.getEvidenceById(caseId, j);
      evidences.push({
        description: evidenceDetails[0],
        fileHash: evidenceDetails[1],
        timestamp: evidenceDetails[2].toNumber(),
        owner: evidenceDetails[3],
      });
    }
    // Sort evidences by their submission timestamp
    evidences.sort((a, b) => a.timestamp - b.timestamp);
    return { evidences, status: true };
  } catch (err: any) {
    console.error(err);
    return { status: false, error: err.message };
  }
};

export const getUserCases = async (userAddress: string) => {
  try {
    if (!provider || !contract) {
      initializeProvider();
    }

    const caseIds = await contract!.getUserCases(userAddress);
    const cases = [];
    for (let i = 0; i < caseIds.length; i++) {
      const caseId = caseIds[i].toNumber();
      const caseDetails = await contract!.getCaseById(caseId);
      cases.push({
        courtId: caseDetails[0],
        caseId: caseDetails[1].toNumber(),
        caseDescription: caseDetails[2],
        caseType: caseDetails[3],
        petitioner: caseDetails[4],
        respondent: caseDetails[5],
        startDateTime: caseDetails[6],
        status: caseDetails[7],
        totalEvidences: caseDetails[8].toNumber(),
      });
    }
    return { cases, status: true };
  } catch (err: any) {
    console.error(err);
    return { status: false, error: err.message };
  }
};

export const getCaseById = async (caseId: string) => {
  try {
    if (!provider || !contract) {
      initializeProvider();
    }

    const caseDetails = await contract!.getCaseById(caseId);
    const formattedCase = {
      courtId: caseDetails[0],
      caseId: caseDetails[1].toNumber(),
      caseDescription: caseDetails[2],
      caseType: caseDetails[3],
      petitioner: caseDetails[4],
      respondent: caseDetails[5],
      startDateTime: caseDetails[6],
      status: caseDetails[7],
      totalEvidences: caseDetails[8].toNumber(),
    };
    return { caseDetails: formattedCase, status: true };
  } catch (err: any) {
    console.error(err);
    return { status: false, error: err.message };
  }
};

export const tipEvidence = async (address: string, amount: string) => {
  try {
    if (!provider || !contract) {
      initializeProvider();
    }

    const signer = provider!.getSigner();
    const contractWithSigner = contract!.connect(signer);

    const tx = await contractWithSigner.tipEvidenceOwner(address, {
      value: utils.parseEther(amount),
    });
    await tx.wait();
    return { status: true };
  } catch (err: any) {
    console.error(err);
    return { status: false, error: err.message };
  }
};

export function convertIPFSUriToUrl(ipfsUri: string): string {
  if (ipfsUri.includes("ipfs://")) {
    return ipfsUri.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return ipfsUri;
}
