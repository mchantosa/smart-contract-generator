import { expect } from "chai";
import { ethers } from "hardhat";
import { ContractTransactionResponse } from "ethers";
import { Signer } from "ethers";
import { BaseContract } from "ethers";

type CustomContract = BaseContract & {
  deploymentTransaction(): ContractTransactionResponse;
} & Omit<BaseContract, keyof BaseContract> & {
    getVotes(): Promise<number[]>;
    getOptions(): Promise<string[]>;
  };
type VoterFixture = { voter: CustomContract; options: string[] };

let accounts: Signer[]; // Top-level accounts variable

describe("Voter", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  async function deployVoterFixture(): Promise<any> {
    const Voter = await ethers.getContractFactory("Voter");
    const options = ["coffee", "tea", "kombucha"];
    const voter = await Voter.deploy(options);
    return { voter, options };
  }

  describe("Deployment", function () {
    let voterFixture: VoterFixture;

    // Before all tests, deploy the voter contract and set up variables
    before(async function () {
      voterFixture = await deployVoterFixture();
      accounts = await ethers.getSigners(); // Set accounts once before tests
    });

    // Test case: Should set the right options
    it("Should set the right options", async function () {
      const { voter, options } = voterFixture;
      expect(await voter.getOptions()).to.eql(options);
    });

    // Test case: Should deploy with 0 votes
    it("Should deploy with no votes", async function () {
      const { voter } = voterFixture;
      const votes = await voter.getVotes();
      expect(votes.map((voteCount) => Number(voteCount))).to.eql([0, 0, 0]);
    });

    // Test case: Should deploy with no accounts having voted
    it("Should deploy with no voted accounts", async function () {
      const { voter } = voterFixture;
      const votes = await voter.getVotes();
      expect(votes.map((voteCount) => Number(voteCount))).to.eql([0, 0, 0]);
    });
  });
});
