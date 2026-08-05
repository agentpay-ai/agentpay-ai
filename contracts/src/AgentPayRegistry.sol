// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title AgentPayRegistry
 * @dev Upgradeable (UUPS ERC-1967) on-chain registry & vault for recording AgentPay AI micropayments and prompt activity.
 */
contract AgentPayRegistry is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    event PromptRecorded(address indexed user, string tool, uint256 timestamp);
    event PaymentReceived(address indexed user, address indexed token, uint256 amount, string tool);
    event TokensWithdrawn(address indexed token, address indexed recipient, uint256 amount);
    event NativeWithdrawn(address indexed recipient, uint256 amount);

    mapping(address => uint256) public userPromptCounts;
    uint256 public totalPromptsRecorded;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    receive() external payable {}
    fallback() external payable {}

    function recordPrompt(address user, string calldata tool) external onlyOwner {
        userPromptCounts[user] += 1;
        totalPromptsRecorded += 1;
        emit PromptRecorded(user, tool, block.timestamp);
    }

    function recordPaymentAndPrompt(
        address user,
        string calldata tool,
        address token,
        uint256 amount
    ) external onlyOwner {
        userPromptCounts[user] += 1;
        totalPromptsRecorded += 1;
        emit PromptRecorded(user, tool, block.timestamp);
        emit PaymentReceived(user, token, amount, tool);
    }

    function withdrawTokens(address token, address recipient, uint256 amount) external onlyOwner {
        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than zero");
        IERC20(token).transfer(recipient, amount);
        emit TokensWithdrawn(token, recipient, amount);
    }

    function withdrawNative(address payable recipient, uint256 amount) external onlyOwner {
        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than zero");
        require(address(this).balance >= amount, "Insufficient native balance");
        recipient.transfer(amount);
        emit NativeWithdrawn(recipient, amount);
    }
}
