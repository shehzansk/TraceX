import { CONTRACT_ADDRESS } from "@/const/value";
import { abi } from "@/const/contract-abi";
import { ethers } from "ethers";

let provider: ethers.providers.Web3Provider | null = null;
let contract: ethers.Contract | null = null;

/**
 * Initializes the Ethereum provider and contract.
 * Must be executed on the client side.
 */
export const initializeProvider = async () => {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    provider = new ethers.providers.Web3Provider(
      (window as any).ethereum as ethers.providers.ExternalProvider
    );
    // Request access to accounts (ensuring the signer is available)
    await (window as any).ethereum.request({ method: "eth_requestAccounts" });
    contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
  } else {
    console.error("Please install MetaMask to use this application!");
    throw new Error("MetaMask not installed");
  }
};

/**
 * Returns the admin address from the contract.
 */
export const getAdmin = async () => {
  try {
    await initializeProvider();
    const signer = provider!.getSigner();
    const contractWithSigner = contract!.connect(signer);
    const admin = await contractWithSigner.admin();
    return admin.toLowerCase();
  } catch (err: any) {
    console.error(err);
    throw err;
  }
};

/**
 * Retrieves the role of a user.
 */
export const getRole = async (userAddress: string) => {
  try {
    await initializeProvider();
    const signer = provider!.getSigner();
    const contractWithSigner = contract!.connect(signer);
    const role = await contractWithSigner.roles(userAddress);
    return role;
  } catch (err: any) {
    console.error(err);
    throw err;
  }
};

/**
 * Retrieves the name associated with a user address.
 */
export const getName = async (userAddress: string) => {
  try {
    await initializeProvider();
    const signer = provider!.getSigner();
    const contractWithSigner = contract!.connect(signer);
    const name = await contractWithSigner.names(userAddress);
    return name;
  } catch (err: any) {
    console.error(err);
    throw err;
  }
};

/**
 * Adds a new member to the network.
 * Only callable by the admin.
 */
export const addMember = async (newMember: string, name: string, role: number) => {
  try {
    await initializeProvider();
    const signer = provider!.getSigner();
    const contractWithSigner = contract!.connect(signer);
    const tx = await contractWithSigner.addMember(newMember, name, role);
    await tx.wait();
    return { status: true };
  } catch (err: any) {
    console.error(err);
    return { status: false, error: err.message };
  }
};

/**
 * Changes the role of an existing member.
 * Only callable by the admin.
 */
export const changeRole = async (memberAddress: string, newRole: number) => {
  try {
    await initializeProvider();
    const signer = provider!.getSigner();
    const contractWithSigner = contract!.connect(signer);
    const tx = await contractWithSigner.changeRole(memberAddress, newRole);
    await tx.wait();
    return { status: true };
  } catch (err: any) {
    console.error(err);
    return { status: false, error: err.message };
  }
};

/**
 * Retrieves all members.
 * Only callable by the admin.
 */
export const getAllMembers = async () => {
  try {
    await initializeProvider();
    const signer = provider!.getSigner();
    const userAddress = (await signer.getAddress()).toLowerCase();
    const adminAddress = await getAdmin();
    if (userAddress !== adminAddress.toLowerCase()) {
      throw new Error("Only admin can access members list.");
    }
    const contractWithSigner = contract!.connect(signer);
    const [memberAddresses, rolesList, namesList] = await contractWithSigner.getAllMembers();
    const members = memberAddresses.map((address: string, index: number) => ({
      address,
      role: rolesList[index],
      name: namesList[index],
    }));
    return { members, status: true };
  } catch (err: any) {
    console.error(err);
    return { status: false, error: err.message };
  }
};

/**
 * Registers a new case.
 * Only callable by Collectors and Admin.
 */
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
    await initializeProvider();
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

/**
 * Registers new evidence for a given case.
 * Only callable by Collectors and Admin.
 */
export const addEvidence = async (
  caseId: string,
  evidenceId: number,
  officerName: string,
  location: string,
  evidenceDescription: string,
  fileUrl: string,
  evidenceType: number
) => {
  try {
    await initializeProvider();
    const signer = provider!.getSigner();
    const contractWithSigner = contract!.connect(signer);

    const tx = await contractWithSigner.registerEvidence(
      caseId,
      evidenceId,
      officerName,
      location,
      evidenceDescription,
      fileUrl,
      evidenceType
    );
    const receipt = await tx.wait();

    // Prepare the audit trail data
    const auditTrailData = {
      evidenceId,
      actions: [
        {
          actionType: 'EvidenceRegistered',
          timestamp: new Date(),
          userAddress: await signer.getAddress(),
          details: `Evidence registered by ${officerName} at ${location}`,
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber
        },
      ],
    };

    // Log data into MongoDB via API call
    const response = await fetch('/api/auditTrail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(auditTrailData),
    });

    if (!response.ok) {
      throw new Error('Failed to log audit trail');
    }

    return { status: true };
  } catch (err) {
    console.error(err);
    return { status: false, error: err.message };
  }
};


/**
 * Changes the status of a case.
 * Only callable by Collectors and Admin.
 */
export const changeCaseStatus = async (caseId: string, newStatus: string) => {
  try {
    await initializeProvider();
    const signer = provider!.getSigner();
    const contractWithSigner = contract!.connect(signer);
    const tx = await contractWithSigner.changeCaseStatus(caseId, newStatus);
    await tx.wait();
    return { status: true };
  } catch (err: any) {
    console.error(err);
    return { status: false, error: err.message };
  }
};

/**
 * Retrieves all case IDs and details.
 * Accessible by Analysts and above.
 */
export const getAllCases = async () => {
  try {
    await initializeProvider();
    const signer = provider!.getSigner();
    const contractWithSigner = contract!.connect(signer);
    const caseIds = await contractWithSigner.getAllCaseIds();
    const cases = [];
    for (let i = 0; i < caseIds.length; i++) {
      const caseId = caseIds[i].toNumber();
      const caseDetails = await contractWithSigner.getCaseById(caseId);
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

/**
 * Retrieves all evidences for a case.
 * Accessible by Analysts and above.
 */
export const getEvidences = async (caseId: string) => {
  try {
    await initializeProvider();
    const signer = provider!.getSigner();
    const contractWithSigner = contract!.connect(signer);
    const totalEvidences = await contractWithSigner.getTotalEvidences(caseId);
    const evidences = [];
    for (let i = 1; i <= totalEvidences.toNumber(); i++) {
      const evidenceDetails = await contractWithSigner.getEvidenceByIndex(caseId, i);
      evidences.push({
        evidenceId: evidenceDetails[0].toNumber(),
        officerName: evidenceDetails[1],
        location: evidenceDetails[2],
        description: evidenceDetails[3],
        fileHash: evidenceDetails[4],
        evidenceType: evidenceDetails[5],
        owner: evidenceDetails[6],
        timestamp: evidenceDetails[7].toNumber(),
      });
    }
    evidences.sort((a, b) => a.timestamp - b.timestamp);
    return { evidences, status: true };
  } catch (err: any) {
    console.error(err);
    return { status: false, error: err.message };
  }
};

/**
 * Retrieves case details by ID.
 * Accessible by Analysts and above.
 */
export const getCaseById = async (caseId: number) => {
  try {
    await initializeProvider();
    const signer = provider!.getSigner();
    const contractWithSigner = contract!.connect(signer);
    const caseDetails = await contractWithSigner.getCaseById(caseId);
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

/**
 * Checks if the current user is at least an Analyst.
 */
export const isAtLeastAnalyst = async (): Promise<boolean> => {
  try {
    await initializeProvider();
    const signer = provider!.getSigner();
    const userAddress = (await signer.getAddress()).toLowerCase();
    const role = await getRole(userAddress);
    return role >= 1; // 1: Admin, 2: Collector, 3: Analyst
  } catch (err: any) {
    console.error(err);
    return false;
  }
};

/**
 * Checks if the current user is a Collector or Admin.
 */
export const isCollectorOrAdmin = async (): Promise<boolean> => {
  try {
    await initializeProvider();
    const signer = provider!.getSigner();
    const userAddress = (await signer.getAddress()).toLowerCase();
    const role = await getRole(userAddress);
    return role === 1 || role === 2; // 1: Admin, 2: Collector
  } catch (err: any) {
    console.error(err);
    return false;
  }
};

/**
 * Converts an IPFS URI to a URL accessible in browsers.
 */
export function convertIPFSUriToUrl(ipfsUri: string): string {
  if (ipfsUri.includes("ipfs://")) {
    return ipfsUri.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return ipfsUri;
}
