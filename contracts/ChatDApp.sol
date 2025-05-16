// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract ChatDApp is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    uint256 public gasPerChar;
    address[] public LPs;
    mapping(address => uint256) public lpBalances;
    mapping(address => string[]) public messages;

    event MessageSent(address indexed from, address indexed to, string message);
    event TokenSent(address indexed from, address indexed to, uint256 amount);
    event LPDeposited(address indexed user, uint256 amount);

    receive() external payable {}

    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        gasPerChar = 200000000000000; // 0.0002 ether in wei
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function sendMessage(address to, string memory msgContent) external payable {
        uint256 requiredFee = bytes(msgContent).length * gasPerChar;
        require(msg.value >= requiredFee, "Insufficient fee");

        messages[to].push(msgContent);
        emit MessageSent(msg.sender, to, msgContent);

        distributeFee(msg.value);
    }

    function sendToken(address to, uint256 amount) external {
        payable(to).transfer(amount);
        emit TokenSent(msg.sender, to, amount);
    }

    function depositLP() external payable {
        if (lpBalances[msg.sender] == 0) {
            LPs.push(msg.sender);
        }
        lpBalances[msg.sender] += msg.value;
        emit LPDeposited(msg.sender, msg.value);
    }

    function distributeFee(uint256 totalFee) internal {
        uint256 totalLP = address(this).balance - totalFee;
        if (totalLP == 0) return;

        for (uint256 i = 0; i < LPs.length; i++) {
            address lp = LPs[i];
            uint256 share = (lpBalances[lp] * totalFee) / totalLP;
            payable(lp).transfer(share);
        }
    }

    function getMessages(address user) external view returns (string[] memory) {
        return messages[user];
    }
}
