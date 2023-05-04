pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract GiftCards is Ownable {
    mapping(bytes32 => bool) public redeemedCodes;
    mapping(bytes32 => bool) public validRegularRedeemCodes;
    mapping(bytes32 => bool) public validWinnerRedeemCodes;
    mapping(address => uint256) public nonces;
    uint256 public redeemedCount;
    uint256 private constant STUDENT_REWARD = 5 * 10**15;
    uint256 private constant WINNER_REWARD = 10 * 10**15;
    uint256 private constant MAX_REDEEM_CODES = 32;

    function redeemGift(bytes32 redeemCode) external {
        _redeemGift(msg.sender, redeemCode);
    }

    function redeemGiftWithMetaTransaction(
        bytes32 redeemCode,
        uint256 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        address student = ECDSA.recover(
            ECDSA.toEthSignedMessageHash(keccak256(abi.encodePacked(redeemCode, nonce))),
            v, r, s
        );

        require(nonces[student] == nonce, "Invalid nonce.");
        nonces[student]++;

        _redeemGift(student, redeemCode);
    }

    function _redeemGift(address student, bytes32 redeemCode) private {
        require(validRegularRedeemCodes[redeemCode] || validWinnerRedeemCodes[redeemCode], "Invalid redeem code.");
        require(!redeemedCodes[redeemCode], "Gift card has already been redeemed.");

        redeemedCodes[redeemCode] = true;
        redeemedCount++;

        uint256 rewardAmount = STUDENT_REWARD;

        if (validWinnerRedeemCodes[redeemCode]) {
            rewardAmount = WINNER_REWARD;
        }

        payable(student).transfer(rewardAmount);
    }

    function validateRegularRedeemCodes(bytes32[] calldata redeemCodes) external onlyOwner {
        require(redeemCodes.length == MAX_REDEEM_CODES, "Invalid number of redeem codes.");

        for (uint256 i = 0; i < redeemCodes.length; i++) {
            validRegularRedeemCodes[redeemCodes[i]] = true;
        }
    }

    function validateWinnerRedeemCodes(bytes32[] calldata winnerRedeemCodes) external onlyOwner {
        require(winnerRedeemCodes.length <= MAX_REDEEM_CODES, "Invalid number of winner redeem codes.");

        for (uint256 i = 0; i < winnerRedeemCodes.length; i++) {
            validWinnerRedeemCodes[winnerRedeemCodes[i]] = true;
        }
    }

    function fundContract() external payable onlyOwner {}

    function withdrawRemainingFunds() external onlyOwner {
        uint256 remainingBalance = address(this).balance;
        payable(msg.sender).transfer(remainingBalance);
    }

    receive() external payable {}
}
