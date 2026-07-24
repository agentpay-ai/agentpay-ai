// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentPayRegistry
 * @dev Onchain registry for recording AgentPay AI user prompt activity
 */
contract AgentPayRegistry is Ownable {
    event PromptRecorded(address indexed user, string tool, uint256 timestamp);

    mapping(address => uint256) public userPromptCounts;
    uint256 public totalPromptsRecorded;

    constructor() Ownable(msg.sender) {}

    function recordPrompt(address user, string calldata tool) external onlyOwner {
        userPromptCounts[user] += 1;
        totalPromptsRecorded += 1;
        emit PromptRecorded(user, tool, block.timestamp);
    }
}
