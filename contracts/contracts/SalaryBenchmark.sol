// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {
    FHE,
    euint64,
    ebool,
    InEuint64
} from "@fhenixprotocol/cofhe-contracts/FHE.sol";

contract SalaryBenchmark {
    uint8 public constant NUM_BUCKETS = 8;
    uint256 public constant MIN_SAMPLE = 5;

    struct RoleConfig {
        uint64[8] boundaries;
        bool initialized;
    }

    mapping(bytes32 => RoleConfig) public roleConfigs;
    mapping(bytes32 => euint64[8]) private bucketCounts;
    mapping(bytes32 => uint256) public totalSubmissions;
    mapping(address => mapping(bytes32 => bool)) public hasSubmitted;

    address public owner;

    event SalarySubmitted(bytes32 indexed roleKey, uint256 totalCount);
    event PercentileRequested(bytes32 indexed roleKey, uint8 bucket);
    event RoleConfigured(bytes32 indexed roleKey);

    constructor() {
        owner = msg.sender;
    }

    function getRoleKey(
        string calldata role,
        string calldata location
    ) public pure returns (bytes32) {
        return keccak256(abi.encode(role, location));
    }

    function configureRole(
        string calldata role,
        string calldata location,
        uint64[8] calldata boundaries
    ) external {
        require(msg.sender == owner, "only owner");
        bytes32 key = getRoleKey(role, location);
        roleConfigs[key] = RoleConfig(boundaries, true);

        euint64 zero = FHE.asEuint64(0);
        for (uint8 i = 0; i < NUM_BUCKETS; i++) {
            bucketCounts[key][i] = zero;
            FHE.allowThis(bucketCounts[key][i]);
        }

        emit RoleConfigured(key);
    }

    function submitSalary(
        InEuint64 calldata encSalary,
        string calldata role,
        string calldata location
    ) external {
        bytes32 key = getRoleKey(role, location);
        require(roleConfigs[key].initialized, "role not configured");
        require(!hasSubmitted[msg.sender][key], "already submitted");

        euint64 salary = FHE.asEuint64(encSalary);
        euint64 one = FHE.asEuint64(1);
        euint64 zero = FHE.asEuint64(0);

        // Cumulative distribution: bucketCounts[i] = count of salaries >= boundaries[i]
        for (uint8 i = 0; i < NUM_BUCKETS; i++) {
            euint64 boundary = FHE.asEuint64(roleConfigs[key].boundaries[i]);
            ebool isAbove = FHE.gte(salary, boundary);
            euint64 increment = FHE.select(isAbove, one, zero);
            bucketCounts[key][i] = FHE.add(bucketCounts[key][i], increment);
            FHE.allowThis(bucketCounts[key][i]);
        }

        hasSubmitted[msg.sender][key] = true;
        totalSubmissions[key]++;

        emit SalarySubmitted(key, totalSubmissions[key]);
    }

    function requestPercentile(
        string calldata role,
        string calldata location,
        uint8 bucket
    ) external {
        bytes32 key = getRoleKey(role, location);
        require(hasSubmitted[msg.sender][key], "submit first");
        require(totalSubmissions[key] >= MIN_SAMPLE, "need more data");
        require(bucket < NUM_BUCKETS, "invalid bucket");

        FHE.decrypt(bucketCounts[key][bucket]);
        emit PercentileRequested(key, bucket);
    }

    function getPercentileResult(
        string calldata role,
        string calldata location,
        uint8 bucket
    ) external view returns (uint64 count, bool ready) {
        bytes32 key = getRoleKey(role, location);
        require(bucket < NUM_BUCKETS, "invalid bucket");
        (uint64 val, bool decrypted) = FHE.getDecryptResultSafe(bucketCounts[key][bucket]);
        return (val, decrypted);
    }

    function getBoundaries(
        string calldata role,
        string calldata location
    ) external view returns (uint64[8] memory) {
        bytes32 key = getRoleKey(role, location);
        return roleConfigs[key].boundaries;
    }

    function isConfigured(
        string calldata role,
        string calldata location
    ) external view returns (bool) {
        return roleConfigs[getRoleKey(role, location)].initialized;
    }
}
