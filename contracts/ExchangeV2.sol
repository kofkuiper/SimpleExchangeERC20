// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ExchangeV2 {
    IERC20 public immutable bobToken;
    address public immutable bobAccount;
    IERC20 public immutable aliceToken;
    address public immutable aliceAccount;

    uint256 public exchangeAmount;
    uint256 public expiredAt;

    enum State {
        DEPLOYED,
        INITIALIZED,
        EXCHANGED,
        CANCELED
    }

    State public state;

    constructor(
        IERC20 _bobToken,
        IERC20 _aliceToken,
        address _aliceAccount
    ) {
        bobToken = _bobToken;
        bobAccount = msg.sender;
        aliceToken = _aliceToken;
        aliceAccount = _aliceAccount;
        state = State.DEPLOYED;
    }

    modifier onlyBob() {
        require(msg.sender == bobAccount, "only Bob");
        _;
    }

    modifier isState(State _state) {
        require(_state == state, "invalid state");
        _;
    }

    function initialize(uint256 _amount)
        public
        onlyBob
        isState(State.DEPLOYED)
    {
        bobToken.transferFrom(bobAccount, address(this), _amount);
        exchangeAmount = _amount;
        expiredAt = block.timestamp + 5 hours;
        state = State.INITIALIZED;
    }

    function exchange(uint256 _amount) payable public isState(State.INITIALIZED) {
        require(msg.value >= 0.1 ether, "pay 0.1 eth");
        require(msg.sender == aliceAccount, "only Alice");
        require(_amount == exchangeAmount, "!eq to exchange amount");

        state = State.EXCHANGED;
        payable(bobAccount).transfer(msg.value);
        aliceToken.transferFrom(aliceAccount, bobAccount, _amount);
        bobToken.transfer(aliceAccount, _amount);
    }

    function withdraw() public onlyBob isState(State.INITIALIZED) {
        require(expiredAt < block.timestamp, "!expired");
        state = State.CANCELED;
        bobToken.transfer(bobAccount, exchangeAmount);
    }
}
