// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

contract Voter {

    struct OptionPos{
        uint pos;
        bool exists;
    }
    uint[] public votes;
    string[] public options;
    mapping (address => bool) hasVoted;
    mapping(string => OptionPos) posOfOption;

    constructor(string[] memory _options){
        options = _options;
        votes = new uint[](_options.length);

        for(uint i = 0; i < options.length; i++){
            OptionPos memory option = OptionPos(i, true);
            posOfOption[options[i]] = option;
        }
    }

    function vote(uint option) public{
        require(option < options.length, "Invalid option");
        require(!hasVoted[msg.sender], "You have already voted");
        recordVote(option);
    }

    function vote(string memory option) public{
        require(!hasVoted[msg.sender], "You have already voted");
        OptionPos memory optionPos = posOfOption[option];
        require(optionPos.exists, "Invalid option");
        recordVote(optionPos.pos);
    }

    function stringEquals(string memory str1, string memory str2) private pure returns(bool){
        return keccak256(bytes(str1)) == keccak256(bytes(str2));
    }

    function recordVote(uint option)private{
        hasVoted[msg.sender] = true;
        votes[option] = votes[option] + 1;
    }

    function getOptions() public view returns(string[] memory){
        return options;
    }

    function getVotes() public view returns(uint[] memory){
        return votes;
    }
}