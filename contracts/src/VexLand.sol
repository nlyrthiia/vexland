// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract VexLand is Ownable, Pausable, ReentrancyGuard {
    // ===== Constants =====
    uint256 public constant SECONDS_PER_DAY = 86400;
    uint32 public constant BASE_POINTS_PER_CHECKIN = 10;
    uint32 public constant SEASON_PASS_MULTIPLIER = 3;

    // ===== State =====
    uint256 public seasonPassPrice;

    struct PlayerData {
        uint32 checkInCount;
        uint64 lastCheckInTimestamp;
        uint32 totalPoints;
        bool seasonPassPurchased;
        uint64 seasonPassPurchaseDate;
        uint32 gold;
        uint32 highestScore;
        uint32 highestTime;
        uint32 walletSignatureCount;
        uint64 lastWalletSignatureTime;
        uint32 playerLevel;
        uint8 vipLevel;
        bool exists;
    }

    mapping(address => PlayerData) public players;
    address[] public playerList;

    // ===== Events =====
    event CheckedIn(address indexed player, uint32 checkInCount, uint32 pointsEarned, uint32 totalPoints, uint64 timestamp);
    event SeasonPassPurchased(address indexed player, uint256 pricePaid, uint64 timestamp);
    event WalletSignatureRecorded(address indexed player, uint32 signatureCount, uint64 timestamp);
    event GameDataUpdated(address indexed player, uint32 gold, uint32 highestScore, uint32 highestTime, uint32 playerLevel);
    event PointsClaimed(address indexed player, uint32 points, uint64 timestamp);
    event SeasonPassPriceUpdated(uint256 oldPrice, uint256 newPrice);

    constructor(uint256 _seasonPassPrice) Ownable(msg.sender) {
        seasonPassPrice = _seasonPassPrice;
    }

    // ===== Player Functions =====

    function checkIn() external whenNotPaused {
        PlayerData storage p = players[msg.sender];

        if (!p.exists) {
            p.exists = true;
            playerList.push(msg.sender);
        }

        require(
            block.timestamp - uint256(p.lastCheckInTimestamp) >= SECONDS_PER_DAY,
            "Check-in cooldown not elapsed"
        );

        uint32 pointsEarned = BASE_POINTS_PER_CHECKIN;
        if (p.seasonPassPurchased) {
            pointsEarned *= SEASON_PASS_MULTIPLIER;
        }

        p.checkInCount += 1;
        p.lastCheckInTimestamp = uint64(block.timestamp);
        p.totalPoints += pointsEarned;

        emit CheckedIn(msg.sender, p.checkInCount, pointsEarned, p.totalPoints, uint64(block.timestamp));
    }

    function purchaseSeasonPass() external payable whenNotPaused nonReentrant {
        PlayerData storage p = players[msg.sender];
        require(p.exists, "Player does not exist. Check in first.");
        require(!p.seasonPassPurchased, "Already has season pass");
        require(msg.value >= seasonPassPrice, "Insufficient payment");

        p.seasonPassPurchased = true;
        p.seasonPassPurchaseDate = uint64(block.timestamp);

        // Refund excess
        if (msg.value > seasonPassPrice) {
            payable(msg.sender).transfer(msg.value - seasonPassPrice);
        }

        emit SeasonPassPurchased(msg.sender, seasonPassPrice, uint64(block.timestamp));
    }

    function recordWalletSignature() external whenNotPaused {
        PlayerData storage p = players[msg.sender];
        if (!p.exists) {
            p.exists = true;
            playerList.push(msg.sender);
        }

        p.walletSignatureCount += 1;
        p.lastWalletSignatureTime = uint64(block.timestamp);

        emit WalletSignatureRecorded(msg.sender, p.walletSignatureCount, uint64(block.timestamp));
    }

    function claimPoints() external whenNotPaused {
        PlayerData storage p = players[msg.sender];
        require(p.exists, "Player does not exist");
        require(p.totalPoints > 0, "No points to claim");

        uint32 claimed = p.totalPoints;
        emit PointsClaimed(msg.sender, claimed, uint64(block.timestamp));
    }

    // ===== View Functions =====

    function getPlayerData(address player) external view returns (
        uint32 checkInCount,
        uint64 lastCheckInTimestamp,
        uint32 totalPoints,
        bool seasonPassPurchased_,
        uint64 seasonPassPurchaseDate,
        uint32 gold,
        uint32 highestScore,
        uint32 highestTime,
        uint32 walletSignatureCount,
        uint64 lastWalletSignatureTime,
        uint32 playerLevel,
        uint8 vipLevel,
        bool exists_
    ) {
        PlayerData storage p = players[player];
        return (
            p.checkInCount,
            p.lastCheckInTimestamp,
            p.totalPoints,
            p.seasonPassPurchased,
            p.seasonPassPurchaseDate,
            p.gold,
            p.highestScore,
            p.highestTime,
            p.walletSignatureCount,
            p.lastWalletSignatureTime,
            p.playerLevel,
            p.vipLevel,
            p.exists
        );
    }

    function canCheckInNow(address player) external view returns (bool) {
        PlayerData storage p = players[player];
        if (!p.exists) return true;
        return block.timestamp - uint256(p.lastCheckInTimestamp) >= SECONDS_PER_DAY;
    }

    function hasSeasonPass(address player) external view returns (bool) {
        return players[player].seasonPassPurchased;
    }

    function getPlayerCount() external view returns (uint256) {
        return playerList.length;
    }

    // ===== Admin Functions =====

    function updateGameData(
        address player, uint32 gold, uint32 highestScore, uint32 highestTime, uint32 playerLevel
    ) external onlyOwner {
        PlayerData storage p = players[player];
        require(p.exists, "Player does not exist");

        p.gold = gold;
        p.highestScore = highestScore;
        p.highestTime = highestTime;
        p.playerLevel = playerLevel;

        emit GameDataUpdated(player, gold, highestScore, highestTime, playerLevel);
    }

    function setSeasonPassPrice(uint256 newPrice) external onlyOwner {
        uint256 oldPrice = seasonPassPrice;
        seasonPassPrice = newPrice;
        emit SeasonPassPriceUpdated(oldPrice, newPrice);
    }

    function setVipLevel(address player, uint8 level) external onlyOwner {
        players[player].vipLevel = level;
    }

    function emergencyPause() external onlyOwner {
        _pause();
    }

    function emergencyUnpause() external onlyOwner {
        _unpause();
    }

    function withdrawFunds(address payable to, uint256 amount) external onlyOwner nonReentrant {
        require(address(this).balance >= amount, "Insufficient balance");
        to.transfer(amount);
    }

    receive() external payable {}
}
