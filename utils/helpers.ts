// helpers.ts
import { CONTRACT_ADDRESS } from "@/const/value";
import { abi } from "@/const/contract-abi";
import { ethers, utils } from "ethers";

let provider: ethers.providers.Web3Provider | null = null;
let contract: ethers.Contract | null = null;

/**
 * Initializes the Ethereum provider and contract.
 * Must be executed on the client side.
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

/**
 * Returns the admin address from the contract.
 */
export const getAdmin = async () => {
  try {
    if (!provider || !contract) {
      initializeProvider();
    }
    const admin = await contract!.admin();
    return admin;
  } catch (err: any) {
    console.error(err);
    throw err;
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
    // The new case ID is totalCases + 1 because totalCases was fetched before increment.
    return { newCaseId: totalCases.toNumber() + 1, status: true };
  } catch (err: any) {
    console.error(err);
    return { status: false, error: err.message };
  }
};

/**
 * addEvidence: Registers new evidence for a given case.
 * Now expects evidenceType (a number from 0 to 7) as an additional parameter.
 */
export const addEvidence = async (
  caseId: string,
  evidenceDescription: string,
  fileUrl: string,
  evidenceType: number
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
      fileUrl,
      evidenceType
    );
    await tx.wait();
    return { status: true };
  } catch (err: any) {
    console.error(err);
    return { status: false, error: err.message };
  }
};

/**
 * addMember: (Admin-only) Admits a new member.
 */
export const addMember = async (newMember: string) => {
  try {
    if (!provider || !contract) {
      initializeProvider();
    }
    const signer = provider!.getSigner();
    const contractWithSigner = contract!.connect(signer);
    const tx = await contractWithSigner.addMember(newMember);
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
    // Assuming your getCaseById returns: 
    // (courtId, caseId, caseDescription, caseType, petitioner, respondent, startDateTime, status, submittedBy, totalEvidences)
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
        submittedBy: caseDetails[8],
        totalEvidences: caseDetails[9].toNumber(),
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
    // Expecting getCaseById to now return totalEvidences in position 9.
    const caseDetails = await contract!.getCaseById(caseId);
    const totalEvidences = caseDetails[9].toNumber();
    const evidences = [];
    for (let j = 1; j <= totalEvidences; j++) {
      // Expecting getEvidenceById returns: description, fileHash, timestamp, owner, evidenceType
      const evidenceDetails = await contract!.getEvidenceById(caseId, j);
      evidences.push({
        description: evidenceDetails[0],
        fileHash: evidenceDetails[1],
        timestamp: evidenceDetails[2].toNumber(),
        owner: evidenceDetails[3],
        evidenceType: evidenceDetails[4],
      });
    }
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
        submittedBy: caseDetails[8],
        totalEvidences: caseDetails[9].toNumber(),
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
      submittedBy: caseDetails[8],
      totalEvidences: caseDetails[9].toNumber(),
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
export const isMember = async (userAddress: string): Promise<boolean> => {
  if (!provider || !contract) {
    initializeProvider();
  }
  return await contract!.members(userAddress);
};
