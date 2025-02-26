// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SecurexPrivate {
    // Admin address
    address public admin;

    // Membership mapping. Only members may register cases and evidences.
    mapping(address => bool) public members;

    // --- Structures and Enums ---

    // Evidence types available
    enum EvidenceType {
        Forensic,
        ComputerBased,
        NetworkInternet,
        SocialMediaCommunication,
        MobileDevice,
        Cybercrime,
        SurveillanceIoT,
        FinancialTransactional
    }

    struct Evidence {
        string description;
        string fileHash;
        EvidenceType evidenceType; // New field
        address owner; // Who submitted the evidence (user id)
        uint256 timestamp;
    }

    struct Case {
        string courtId;
        uint256 caseId;
        string caseDescription;
        string caseType;
        string petitioner;
        string respondent;
        string startDateTime;
        string status;
        address submittedBy; // Who registered the case
        mapping(uint256 => Evidence) evidences;
        uint256 totalEvidences;
        bool initialised;
    }

    // Mapping of case ID to Case struct and list of all case IDs
    mapping(uint256 => Case) public cases;
    uint256[] public caseIds;

    // Mapping to track which cases an account registered
    mapping(address => uint256[]) public userCases;

    uint256 public totalCases;

    // --- Events ---

    event MemberAdded(address member);
    event CaseRegistered(
        string courtId,
        uint256 caseId,
        string caseDescription,
        string caseType,
        string petitioner,
        string respondent,
        address submittedBy,
        uint256 totalEvidences,
        string startDateTime,
        string status
    );
    event EvidenceRegistered(
        uint256 caseId,
        uint256 evidenceId,
        string description,
        string fileHash,
        EvidenceType evidenceType,
        address owner,
        uint256 timestamp
    );

    // --- Modifiers ---

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyMember() {
        require(
            members[msg.sender],
            "Only approved members can perform this action"
        );
        _;
    }

    // --- Constructor ---

    constructor() {
        admin = msg.sender;
        members[msg.sender] = true; // Admin is automatically a member.
    }

    // --- Admin Functions ---

    /// @notice Admit a new member (only callable by admin).
    function addMember(address _member) external onlyAdmin {
        require(_member != address(0), "Invalid address");
        members[_member] = true;
        emit MemberAdded(_member);
    }

    // --- Case Functions ---

    /// @notice Register a new case (only callable by approved members)
    function registerCase(
        string memory _courtId,
        string memory _caseDescription,
        string memory _caseType,
        string memory _petitioner,
        string memory _respondent,
        string memory _startDateTime,
        string memory _status
    ) external onlyMember {
        require(bytes(_courtId).length > 0, "Court ID required");
        require(
            bytes(_caseDescription).length > 0,
            "Case description required"
        );
        require(bytes(_caseType).length > 0, "Case type required");
        require(bytes(_petitioner).length > 0, "Petitioner required");
        require(bytes(_respondent).length > 0, "Respondent required");
        require(bytes(_startDateTime).length > 0, "Start Date required");
        require(bytes(_status).length > 0, "Status required");

        totalCases++;
        Case storage newCase = cases[totalCases];
        newCase.courtId = _courtId;
        newCase.caseId = totalCases;
        newCase.caseDescription = _caseDescription;
        newCase.caseType = _caseType;
        newCase.petitioner = _petitioner;
        newCase.respondent = _respondent;
        newCase.startDateTime = _startDateTime;
        newCase.status = _status;
        newCase.submittedBy = msg.sender;
        newCase.totalEvidences = 0;
        newCase.initialised = true;

        caseIds.push(totalCases);
        userCases[msg.sender].push(totalCases);

        emit CaseRegistered(
            _courtId,
            totalCases,
            _caseDescription,
            _caseType,
            _petitioner,
            _respondent,
            msg.sender,
            0,
            _startDateTime,
            _status
        );
    }

    // --- Evidence Functions ---

    /// @notice Register new evidence for a given case.
    /// @param _caseId ID of the case
    /// @param _description Description of the evidence.
    /// @param _fileHash IPFS hash or similar file reference.
    /// @param _evidenceType Numeric value corresponding to the EvidenceType enum.
    function registerEvidence(
        uint256 _caseId,
        string memory _description,
        string memory _fileHash,
        uint8 _evidenceType
    ) external onlyMember {
        require(_caseId > 0 && _caseId <= totalCases, "Invalid case ID");
        require(cases[_caseId].initialised, "Case not initialised");
        require(
            bytes(_description).length > 0,
            "Evidence description required"
        );
        require(bytes(_fileHash).length > 0, "File hash required");
        require(_evidenceType < 8, "Invalid evidence type");

        Case storage currentCase = cases[_caseId];
        currentCase.totalEvidences++;
        uint256 evidenceId = currentCase.totalEvidences;
        currentCase.evidences[evidenceId] = Evidence({
            description: _description,
            fileHash: _fileHash,
            evidenceType: EvidenceType(_evidenceType),
            owner: msg.sender,
            timestamp: block.timestamp
        });

        emit EvidenceRegistered(
            _caseId,
            evidenceId,
            _description,
            _fileHash,
            EvidenceType(_evidenceType),
            msg.sender,
            block.timestamp
        );
    }

    // --- View Functions ---

    /// @notice Retrieve the admin address.
    function getAdmin() public view returns (address) {
        return admin;
    }

    /// @notice Retrieve all registered case IDs.
    function getAllCaseIds() external view returns (uint256[] memory) {
        return caseIds;
    }

    /// @notice Retrieve a case’s primary information.
    function getCaseById(
        uint256 _caseId
    )
        external
        view
        returns (
            string memory,
            uint256,
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            address,
            uint256
        )
    {
        require(cases[_caseId].initialised, "Case does not exist");
        Case storage retrieved = cases[_caseId];
        return (
            retrieved.courtId,
            retrieved.caseId,
            retrieved.caseDescription,
            retrieved.caseType,
            retrieved.petitioner,
            retrieved.respondent,
            retrieved.startDateTime,
            retrieved.status,
            retrieved.submittedBy,
            retrieved.totalEvidences
        );
    }

    /// @notice Retrieve a specific evidence from a case.
    function getEvidenceById(
        uint256 _caseId,
        uint256 _evidenceId
    )
        external
        view
        returns (string memory, string memory, uint256, address, EvidenceType)
    {
        require(cases[_caseId].initialised, "Case does not exist");
        Evidence storage evd = cases[_caseId].evidences[_evidenceId];
        return (
            evd.description,
            evd.fileHash,
            evd.timestamp,
            evd.owner,
            evd.evidenceType
        );
    }

    /// @notice Retrieve all case IDs registered by a specific user.
    function getUserCases(
        address _user
    ) external view returns (uint256[] memory) {
        return userCases[_user];
    }

    /// @notice Function to tip the evidence owner.
    function tipEvidenceOwner(address payable _owner) external payable {
        require(msg.value > 0, "Tip must be greater than 0");
        _owner.transfer(msg.value);
    }
}
