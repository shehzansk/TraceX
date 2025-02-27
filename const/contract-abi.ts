export const abi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_member",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "enum SecurexPrivateV2.Role",
        "name": "_role",
        "type": "uint8"
      }
    ],
    "name": "addMember",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "courtId",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "caseId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "caseDescription",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "caseType",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "petitioner",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "respondent",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "submittedBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalEvidences",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "startDateTime",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "status",
        "type": "string"
      }
    ],
    "name": "CaseRegistered",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_caseId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_newStatus",
        "type": "string"
      }
    ],
    "name": "changeCaseStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_member",
        "type": "address"
      },
      {
        "internalType": "enum SecurexPrivateV2.Role",
        "name": "_newRole",
        "type": "uint8"
      }
    ],
    "name": "changeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "caseId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "evidenceIndex",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "evidenceId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "fileHash",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "enum SecurexPrivateV2.EvidenceType",
        "name": "evidenceType",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "officerName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "location",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "EvidenceRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "member",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "enum SecurexPrivateV2.Role",
        "name": "role",
        "type": "uint8"
      }
    ],
    "name": "MemberAdded",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_courtId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_caseDescription",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_caseType",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_petitioner",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_respondent",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_startDateTime",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_status",
        "type": "string"
      }
    ],
    "name": "registerCase",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_caseId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_evidenceId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_officerName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_location",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_fileHash",
        "type": "string"
      },
      {
        "internalType": "uint8",
        "name": "_evidenceType",
        "type": "uint8"
      }
    ],
    "name": "registerEvidence",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "member",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "enum SecurexPrivateV2.Role",
        "name": "newRole",
        "type": "uint8"
      }
    ],
    "name": "RoleChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "caseId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "newStatus",
        "type": "string"
      }
    ],
    "name": "StatusChanged",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "caseIds",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "cases",
    "outputs": [
      {
        "internalType": "string",
        "name": "courtId",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "caseId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "caseDescription",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "caseType",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "petitioner",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "respondent",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "startDateTime",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "status",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "submittedBy",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "totalEvidences",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "initialised",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllCaseIds",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllMembers",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      },
      {
        "internalType": "enum SecurexPrivateV2.Role[]",
        "name": "",
        "type": "uint8[]"
      },
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_caseId",
        "type": "uint256"
      }
    ],
    "name": "getCaseById",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_caseId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_evidenceIndex",
        "type": "uint256"
      }
    ],
    "name": "getEvidenceByIndex",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "evidenceId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "officerName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "location",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "fileHash",
        "type": "string"
      },
      {
        "internalType": "enum SecurexPrivateV2.EvidenceType",
        "name": "evidenceType",
        "type": "uint8"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_address",
        "type": "address"
      }
    ],
    "name": "getName",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_address",
        "type": "address"
      }
    ],
    "name": "getRole",
    "outputs": [
      {
        "internalType": "enum SecurexPrivateV2.Role",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_caseId",
        "type": "uint256"
      }
    ],
    "name": "getTotalEvidences",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "members",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "names",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "roles",
    "outputs": [
      {
        "internalType": "enum SecurexPrivateV2.Role",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalCases",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]