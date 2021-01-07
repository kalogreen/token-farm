pragma solidity ^0.5.0;

import "./DaiToken.sol";
import "./DappToken.sol";

contract TokenFarm{
    //All code goes here...

    //created a state variable. Meaning this variables value will be stored on the blockchain. 'public' modifier makes this variable accesible from outside the smart contract
    string public name = "Dapp Token Farm";
    address public owner;
    DappToken public dappToken;     //assigned state variables
    DaiToken public daiToken;


    address[] public stakers;       //an array to keep track of all the addresses that have ever staked
    // A mapping inside of solidity is a key value (key => value) store data stucture
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    // constructor fxn is run once and only once whenever the SC is deployed to the network
    //fxn parameters/arguments passed into constructor are in the form 'varType, varName'. In this case the variable types are the smart contracts themselves and the var names are the SC addresses (eg. _dappToken --> which is local variable and therefore requires assigned 'public' state for access outside the fxn and SC if need be)
    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // ***Stake Tokens --> Deposit (allows investor to deposit DAI into this SC (TokenFarm) to start earning rewards)
    function stakeTokens(uint _amount) public {
        // Code goes inside here...

        // Require amount staking is greater than 0
        require(_amount > 0, "amount cannot be 0");     // require is fxn in solidity that will allow program to continue running if the argument passed in evaluates to true. If it is false then the fxn will stop, raise an exception and surface the message that follows the argument, none of the code after the failed require fxn will run and therefore the txn will fail

        // Transfer mock DAI tokens to this contract for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);
        // 'msg.sender' is a special variable inside of solidity: 'msg' is a global variable
        // that corresponds to the mesaages being sent whenever the function some fxn is called,
        // & 'sender' is the person who initiated (ie called) that fxn
        //
        // 'address(this)' refers to the address of this smart contract (TokenFarm): 'this' refers
        // to this contract itself, and 'address()' converts it to an address type
        //
        // '_amount' is the amount that gets passed in when you call the 'stakeTokens(uint _amount)' fxn


        // Update staking balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;       // here the stakingBalance[msg.sender], or existing balance, is added to the '_amount' to factor in for if a user calls stakeTokens fxn more than once

        // Add users to stakers array *only* if they haven't staked already
        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        // Update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }


    // ***Unstaking Tokens --> Withdraw
    function unstakeTokens() public {
        // Fetch staking balance
        uint balance = stakingBalance[msg.sender];

        // Require amount greater than 0
        require(balance > 0, "staking balance cannot be 0");

        // Transfer Mock DAI tokens back to investor
        daiToken.transfer(msg.sender, balance);

        // Reset staking balance
        stakingBalance[msg.sender] = 0;

        // Update staking status
        isStaking[msg.sender] = false;

    }


    // ***Issuing Tokens (staking rewards)
    function issueTokens() public {
        // Only the owner can call this fxn
        require(msg.sender == owner, "caller must be the owner");

        // Issue tokens to all stakers
        for (uint i=0; i<stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance > 0) {
                dappToken.transfer(recipient, balance);
            }
        }
    }


}
