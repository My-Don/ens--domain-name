// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

contract TestContract {
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    function getOwner() public view returns (address) {
        return owner;
    }
}