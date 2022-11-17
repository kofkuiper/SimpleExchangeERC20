// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
contract Exchange {

    IERC20 public immutable bobToken;
    address public immutable bobAccount;
    IERC20 public immutable aliceToken;
    address public immutable aliceAccount;

    bool public initialized;
    uint256 public exchangeAmount;
    uint256 public expiredAt;
    bool public exchanged;
    bool public canceled;

    constructor(IERC20 _bobToken, IERC20 _aliceToken, address _aliceAccount) {
        bobToken = _bobToken;
        bobAccount = msg.sender;
        aliceToken = _aliceToken;
        aliceAccount = _aliceAccount;
    }

    function initialize(uint256 _amount) public {
        require(msg.sender == bobAccount, "only Bob");
        require(!initialized, "initialized");

        bobToken.transferFrom(bobAccount, address(this), _amount);
        exchangeAmount = _amount;
        expiredAt = block.timestamp + 5 hours;
        initialized = true;
    }

    function exchange(uint256 _amount) public {
        require(msg.sender == aliceAccount, "only Alice");
        require(initialized, "!initialized");
        require(!exchanged, "!exchanged");
        require(_amount == exchangeAmount, "!eq to exchange amount");

        exchanged = true;
        aliceToken.transferFrom(aliceAccount, bobAccount, _amount);
        bobToken.transfer(aliceAccount, _amount);
    }

    function withdraw() public {
        require(msg.sender == bobAccount, "only Bob");
        require(initialized, "!initialized");
        require(!exchanged, "exchanged");
        require(expiredAt < block.timestamp, "!expired");
        require(!canceled, "canceled");

        bobToken.transfer(bobAccount, exchangeAmount);
        canceled = true;
    }

}