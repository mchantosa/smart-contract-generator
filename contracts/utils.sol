// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

library Utils {
    function etherToWei(uint sumInEther) public pure returns(uint){
        return sumInEther * 1 ether;
    }

    function minutesToSeconds(uint timeInMin) public pure returns(uint){
        return timeInMin * 1 minutes;
    }
}