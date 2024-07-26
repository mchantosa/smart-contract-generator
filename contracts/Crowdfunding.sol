// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
// import {Utils} from  "./utils.sol";

library Utils {
    function etherToWei(uint sumInEther) public pure returns(uint){
        return sumInEther * 1 ether;
    }

    function minutesToSeconds(uint timeInMin) public pure returns(uint){
        return timeInMin * 1 minutes;
    }
}

contract Crowdfunding is Ownable{
  using Utils for uint;

  enum State{Ongoing, Failed, Succeeded, PaidOut}

  event CampaignFinished(
    address addr,
    uint totalCollected,
    bool success
  );

  string public name;
  uint public targetAmount;
  uint public fundingDeadline;
  address payable public beneficiary;
  State public state;
  mapping(address => uint) public amounts;
  bool public collected;

  modifier inState(State expectedState){
    require(state == expectedState, "Incorrect crowdfunding state");
    _;
  }

  // Custom error for unauthorized access
  error Unauthorized();

  constructor(
    string memory campaignName,
    uint targetAmountEth,
    uint durationInMin,
    address payable beneficiaryAddress
  ) Ownable(beneficiaryAddress){
    name = campaignName;
    targetAmount = targetAmountEth.etherToWei();
    fundingDeadline = currentTime() + durationInMin.minutesToSeconds();
    beneficiary = beneficiaryAddress;
    state = State.Ongoing;
  }

  receive() external payable inState(State.Ongoing){
    require(beforeDeadline(), "Deadline has passed");

    amounts[msg.sender] += msg.value;
    if(totalCollected() >= targetAmount){
      collected = true;
    }
  }

  function cancelCrowdfunding() public inState(State.Ongoing) onlyOwner(){
    require(beforeDeadline(), "Deadline has passed");
    state = State.Failed;
  }

  function totalCollected() public view returns(uint){
    return address(this).balance;
  }

  function finishedCrowdfunding() public inState(State.Ongoing){
    require(afterDeadline(), "Deadline has not passed");
    
    if(!collected){
      state = State.Failed;
    } else {
      state = State.Succeeded;
    }

    emit CampaignFinished(address(this), totalCollected(), collected);
  }

  function collect() inState(State.Succeeded) public {
    if(beneficiary.send(totalCollected())){
      state = State.PaidOut;
    } else {
      state = State.Failed;
    }
  }

  function withdraw() public inState(State.Failed){
    require(amounts[msg.sender] > 0, "No funds for account");
    uint contributed = amounts[msg.sender];
    amounts[msg.sender] = 0;

    payable(msg.sender).transfer(contributed);
  }

  function currentTime() private view returns(uint){
    return block.timestamp;
  }

  function beforeDeadline() private view returns(bool){
    return currentTime() < fundingDeadline;
  }

  function afterDeadline() private view returns(bool){
    return !beforeDeadline();
  }

}