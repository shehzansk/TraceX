// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract Securex {
    string public name;

    mapping(uint256 => Case) public cases;
    uint256[] public caseIds;
    mapping(address => uint256[]) public userCases;

    uint256 public totalCases = 0;

    struct Evidence {
        string description;
        string fileHash;
        address owner;
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
        mapping(uint256 => Evidence) evidences;
        uint256 totalEvidences;
        bool initialised;
    }

    event EvidenceRegistered(
        uint256 caseId,
        uint256 evidenceId,
        string description,
        string fileHash,
        address owner,
        uint256 timestamp
    );

    event CaseRegistered(
        string courtId,
        uint256 caseId,
        string caseDescription,
        string caseType,
        string petitioner,
        string respondent,
        uint256 totalEvidences,
        string startDateTime,
        string status
    );

    event EvidenceTipped(uint256 tipAmount, address payable author);

    constructor() {
        name = "secureX";
    }

    function registerCase(
        string memory _courtId,
        string memory _caseDescription,
        string memory _caseType,
        string memory _petitioner,
        string memory _respondent,
        string memory _startDateTime,
        string memory _status
    ) public {
        require(bytes(_courtId).length > 0, "Court ID is required");
        require(
            bytes(_caseDescription).length > 0,
            "Case description is required"
        );
        require(bytes(_caseType).length > 0, "Case type is required");
        require(bytes(_petitioner).length > 0, "Petitioner is required");
        require(bytes(_respondent).length > 0, "Respondent is required");
        require(bytes(_startDateTime).length > 0, "Start date is required");
        require(bytes(_status).length > 0, "Status is required");

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
            0,
            _startDateTime,
            _status
        );
    }

    function registerEvidence(
        uint256 _caseId,
        string memory _description,
        string memory _fileHash
    ) public {
        require(_caseId > 0 && _caseId <= totalCases, "Invalid case ID");
        require(cases[_caseId].initialised, "Case does not exist");
        require(
            bytes(_description).length > 0,
            "Evidence description is required"
        );
        require(bytes(_fileHash).length > 0, "File hash is required");

        Case storage contextCase = cases[_caseId];
        contextCase.totalEvidences++;
        uint256 evidenceId = contextCase.totalEvidences;

        contextCase.evidences[evidenceId] = Evidence({
            description: _description,
            fileHash: _fileHash,
            owner: msg.sender,
            timestamp: block.timestamp
        });

        emit EvidenceRegistered(
            _caseId,
            evidenceId,
            _description,
            _fileHash,
            msg.sender,
            block.timestamp
        );
    }

    function getCaseById(
        uint256 _caseId
    )
        external
        view
        returns (
            string memory courtId,
            uint256 caseId,
            string memory caseDescription,
            string memory caseType,
            string memory petitioner,
            string memory respondent,
            string memory startDateTime,
            string memory status,
            uint256 totalEvidences
        )
    {
        require(cases[_caseId].initialised, "No such case exists");
        Case storage reqcase = cases[_caseId];
        return (
            reqcase.courtId,
            reqcase.caseId,
            reqcase.caseDescription,
            reqcase.caseType,
            reqcase.petitioner,
            reqcase.respondent,
            reqcase.startDateTime,
            reqcase.status,
            reqcase.totalEvidences
        );
    }

    function getEvidenceById(
        uint256 _caseId,
        uint256 _evidenceId
    )
        external
        view
        returns (
            string memory description,
            string memory fileHash,
            uint256 timestamp,
            address owner
        )
    {
        require(cases[_caseId].initialised, "No such case exists");
        Evidence memory evd = cases[_caseId].evidences[_evidenceId];
        return (evd.description, evd.fileHash, evd.timestamp, evd.owner);
    }

    function getUserCases(
        address _user
    ) external view returns (uint256[] memory) {
        return userCases[_user];
    }

    function getAllCaseIds() external view returns (uint256[] memory) {
        return caseIds;
    }

    function tipEvidenceOwner(address payable _owner) public payable {
        require(msg.value > 0, "Tip amount should be greater than zero");
        _owner.transfer(msg.value);
        emit EvidenceTipped(msg.value, _owner);
    }
}
