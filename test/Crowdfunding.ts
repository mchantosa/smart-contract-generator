import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import Web3 from "web3";
import { Crowdfunding } from "../typechain-types";
const { ethers } = hre; // Access ethers from Hardhat Runtime Environment
const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

describe("Crowdfunding", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  async function deployCrowdfundingFixture() {
    const accounts = await ethers.getSigners();
    const Utils = await hre.ethers.getContractFactory(
      "contracts/utils.sol:Utils"
    );
    const utils = await Utils.deploy();
    const Crowdfunding = await hre.ethers.getContractFactory("Crowdfunding", {
      libraries: {
        Utils: await utils.getAddress(),
      },
    });
    const params = {
      name: "crowdfundme",
      targetAmount: 1, // ether
      fundingDeadline: 10, // minutes from now
      beneficiary: await accounts[0].getAddress(),
    };
    const states = { ONGOING: 0, FAILED: 1, SUCCEEDED: 2, PAID_OUT: 3 };
    const computedTargetAmount = convertEtherToWei(params.targetAmount);
    const computedFundingDeadline =
      (await time.latest()) +
      convertMinutesToSeconds(params.fundingDeadline) +
      1;
    const crowdfunding = await Crowdfunding.deploy(
      params.name,
      params.targetAmount,
      params.fundingDeadline,
      params.beneficiary
    );
    async function fund(account: number, amount: number | bigint) {
      //console.log("funding: ", account, amount);
      return await accounts[account].sendTransaction({
        to: crowdfunding.getAddress(),
        value: convertEtherToWei(amount),
      });
    }

    return {
      crowdfunding,
      params,
      states,
      computedTargetAmount,
      computedFundingDeadline,
      accounts,
      fund,
    };
  }

  describe("deployment state", function () {
    it("Should set the correct name", async function () {
      const { crowdfunding, params } = await loadFixture(
        deployCrowdfundingFixture
      );
      const name = await crowdfunding.name();
      expect(name).to.equal(params.name);
    });

    it("Should set the correct target amount", async function () {
      const { crowdfunding, computedTargetAmount } = await loadFixture(
        deployCrowdfundingFixture
      );
      const targetAmount = await crowdfunding.targetAmount();
      expect(targetAmount).to.equal(computedTargetAmount);
    });

    it("Should set the correct funding deadline", async function () {
      const { crowdfunding, computedFundingDeadline } = await loadFixture(
        deployCrowdfundingFixture
      );
      const fundingDeadline = await crowdfunding.fundingDeadline();
      expect(fundingDeadline).to.equal(computedFundingDeadline);
    });

    it("Should set the correct beneficiary", async function () {
      const { crowdfunding, params } = await loadFixture(
        deployCrowdfundingFixture
      );
      const beneficiary = await crowdfunding.beneficiary();
      expect(beneficiary).to.equal(params.beneficiary);
    });

    it("Should set the correct state", async function () {
      const { crowdfunding, states } = await loadFixture(
        deployCrowdfundingFixture
      );
      const state = await crowdfunding.state();
      expect(state).to.equal(states.ONGOING);
    });

    it("Should set the correct collected value", async function () {
      const { crowdfunding } = await loadFixture(deployCrowdfundingFixture);
      const collected = await crowdfunding.collected();
      expect(collected).to.equal(false);
    });
  });

  describe("collected field", function () {
    it("Should return true if the target has been exactly reached", async function () {
      const { crowdfunding, accounts, params, fund } = await loadFixture(
        deployCrowdfundingFixture
      );
      await fund(1, params.targetAmount);

      let collected = await crowdfunding.collected();
      expect(collected).to.equal(true);
    });

    it("Should return true if the target has been exceeded", async function () {
      const { crowdfunding, params, fund } = await loadFixture(
        deployCrowdfundingFixture
      );
      await fund(1, params.targetAmount * 1.25);

      let collected = await crowdfunding.collected();
      expect(collected).to.equal(true);
    });

    it("Should return false if the target has not been reached", async function () {
      const { crowdfunding, params, fund } = await loadFixture(
        deployCrowdfundingFixture
      );
      await fund(1, params.targetAmount * 0.25);

      let collected = await crowdfunding.collected();
      expect(collected).to.equal(false);
    });
  });

  describe("state field", function () {
    it("Should set the state correctly when campaign fails", async function () {
      const { crowdfunding, params, states } = await loadFixture(
        deployCrowdfundingFixture
      );

      await time.increase(convertMinutesToSeconds(params.fundingDeadline + 1));
      await crowdfunding.finishedCrowdfunding();

      const state = await crowdfunding.state();
      expect(state).to.equal(states.FAILED);
    });

    it("Should set the state correctly when campaign succeeds", async function () {
      const { crowdfunding, params, states, fund } = await loadFixture(
        deployCrowdfundingFixture
      );
      await fund(1, params.targetAmount + 1);

      await time.increase(convertMinutesToSeconds(params.fundingDeadline + 1));
      await crowdfunding.finishedCrowdfunding();

      const state = await crowdfunding.state();
      expect(state).to.equal(states.SUCCEEDED);
    });
  });

  describe("receive method", function () {
    describe("Contract accepts ETH contribution", function () {
      it("Should update the total contributor contributions with amounts", async function () {
        const { crowdfunding, accounts, fund } = await loadFixture(
          deployCrowdfundingFixture
        );
        const contributor = 1;
        const contributorAddress = accounts[1].address;
        const contribution = 0.25;

        // Sending Ether to the contract twice
        await fund(contributor, contribution);
        await fund(contributor, contribution);

        // Fetching the total contributed amount by the contributor
        const contributedAmount = await crowdfunding.amounts(
          contributorAddress
        );

        // Checking if the total contributed amount matches the expected value
        expect(contributedAmount).to.equal(convertEtherToWei(2 * contribution));
      });

      it("Should retrieve total contributions with totalCollected", async function () {
        const { crowdfunding, fund } = await loadFixture(
          deployCrowdfundingFixture
        );

        // Sending Ether to the contract
        await fund(1, 0.25);
        await fund(2, 0.35);
        await fund(3, 0.15);

        const contributions = await crowdfunding.totalCollected();
        expect(contributions).to.equal(convertEtherToWei(0.25 + 0.35 + 0.15));
      });

      it("Should not allow contribution after deadline", async function () {
        const { params, fund } = await loadFixture(deployCrowdfundingFixture);

        // Waiting for the funding deadline
        await time.increase(
          convertMinutesToSeconds(params.fundingDeadline + 1)
        );

        // Sending Ether to the contract
        await expect(fund(1, 0.25)).to.be.revertedWith("Deadline has passed");
      });
    });
  });

  describe("collect method", function () {
    it("Should transfer the balance from a successful campaign to beneficiary", async function () {
      const { crowdfunding, params, states, fund } = await loadFixture(
        deployCrowdfundingFixture
      );

      // Sending exact target Ether to the contract
      await fund(1, 1);

      // Waiting for the funding deadline
      await time.increase(convertMinutesToSeconds(params.fundingDeadline + 1));
      await crowdfunding.finishedCrowdfunding();

      // Get the beneficiary balance before collecting
      const initialBalance = await ethers.provider.getBalance(
        params.beneficiary
      );

      // Collect balance
      const txResponse = await crowdfunding.collect();
      const txReceipt = await txResponse.wait();

      // Calculate the gas cost
      const gasUsed = txReceipt ? txReceipt.gasUsed : 0;
      const gasPrice = txResponse.gasPrice;
      const gasCost = BigInt(gasUsed) * gasPrice;

      // Get the beneficiary balance after collecting
      const newBalance = await ethers.provider.getBalance(params.beneficiary);

      // Confirming if the beneficiary balance matches the expected value
      const targetAmountInWei = convertEtherToWei(params.targetAmount);
      expect(newBalance).to.equal(initialBalance + targetAmountInWei - gasCost);

      // Confirming if the campaign state is correct
      const fundingState = await crowdfunding.state();
      expect(fundingState).to.equal(states.PAID_OUT);
    });

    it("Should not transfer the balance from a successful campaign to beneficiary", async function () {
      const { crowdfunding, params, fund } = await loadFixture(
        deployCrowdfundingFixture
      );
      await fund(1, 0.25);

      await time.increase(convertMinutesToSeconds(params.fundingDeadline + 1));
      await crowdfunding.finishedCrowdfunding();

      await expect(crowdfunding.collect()).to.be.revertedWith(
        "Incorrect crowdfunding state"
      );
    });
  });

  describe("withdraw method", function () {
    describe("Should return funds to contributors if target is not reached", function () {
      const contributors = [1, 2, 3];
      const contributions = [0.25, 0.35, 0.15];
      let contributorsBalances: Map<number, any>;
      let _crowdfunding: Crowdfunding;
      let _states: {
        ONGOING: number;
        FAILED: number;
        SUCCEEDED: number;
        PAID_OUT: number;
      };
      let prewithdrawBalance: bigint;

      before(async function () {
        const { crowdfunding, accounts, params, states, fund } =
          await loadFixture(deployCrowdfundingFixture);
        _crowdfunding = crowdfunding;
        _states = states;

        for (let i = 0; i < contributors.length; i++) {
          await fund(contributors[i], contributions[i]);
        }

        prewithdrawBalance = await ethers.provider.getBalance(
          _crowdfunding.getAddress()
        );

        await time.increase(
          convertMinutesToSeconds(params.fundingDeadline + 1)
        );
        await crowdfunding.finishedCrowdfunding();

        // Withdraw funds and record gas costs
        const withdrawAndRecordGas = async (contributor: number) => {
          const txResponse = await crowdfunding
            .connect(accounts[contributor])
            .withdraw();
          const txReceipt = await txResponse.wait();
          const gasUsed = txReceipt ? txReceipt.gasUsed : 0;
          const gasPrice = txResponse.gasPrice;
          const gasCost = BigInt(gasUsed) * gasPrice;
          return gasCost;
        };

        // Get initial balances
        contributorsBalances = new Map();
        for (const contributor of contributors) {
          const initialBalance = await ethers.provider.getBalance(
            accounts[contributor].address
          );
          const gasSpent = await withdrawAndRecordGas(contributor);
          const finalBalance = await ethers.provider.getBalance(
            accounts[contributor].address
          );

          contributorsBalances.set(contributor, {
            initialBalance,
            gasSpent,
            finalBalance,
          });
        }
      });

      // Confirm state reflects failure
      it("Confirm state reflects failure", async () => {
        const fundingState = await _crowdfunding.state();
        expect(fundingState).to.equal(_states.FAILED);
      });

      // Confirming if funds are returned to contributors
      it("Confirming if funds are returned to contributors", async () => {
        for (let i = 0; i < contributors.length; i++) {
          const { initialBalance, gasSpent, finalBalance } =
            contributorsBalances.get(contributors[i]);
          const contributionInWei = convertEtherToWei(contributions[i]);
          expect(contributionInWei).to.equal(
            finalBalance - initialBalance + gasSpent
          );
        }
      });

      // Confirm contract balance is zero
      it("Confirm contract balance was non-zero", async () => {
        expect(prewithdrawBalance).to.equal(
          convertEtherToWei(contributions.reduce((a, b) => a + b, 0))
        );
      });

      // Confirm contract balance is zero
      it("Confirm contract balance is zero", async () => {
        const contractBalance = await ethers.provider.getBalance(
          _crowdfunding.getAddress()
        );
        expect(contractBalance).to.equal(0);
      });
    });
  });

  describe("campaignFinished event", function () {
    it("Should emit an event on campaign finished", async function () {
      const { crowdfunding, params, fund } = await loadFixture(
        deployCrowdfundingFixture
      );
      await fund(1, 0.25);

      await time.increase(convertMinutesToSeconds(params.fundingDeadline + 1));
      const transaction = await crowdfunding.finishedCrowdfunding();
      const receipt = await transaction.wait();

      expect(receipt?.logs.length).to.equal(1);

      await expect(receipt)
        .to.emit(crowdfunding, "CampaignFinished")
        .withArgs(crowdfunding.getAddress(), convertEtherToWei(0.25), false);
    });
  });

  describe("cancelCrowdfunding method", function () {
    it("Should allow owner to cancel crowdfunding", async function () {
      const { crowdfunding, params, states } = await loadFixture(
        deployCrowdfundingFixture
      );
      await crowdfunding.cancelCrowdfunding({ from: params.beneficiary });
      const state = await crowdfunding.state();
      expect(state).to.equal(states.FAILED);
    });

    it("Should not allow non-owner to cancel crowdfunding", async function () {
      const { crowdfunding, accounts } = await loadFixture(
        deployCrowdfundingFixture
      );
      const nonOwner = accounts[1];

      try {
        await crowdfunding.cancelCrowdfunding({ from: nonOwner.address });
        expect.fail("Expected an error, but none was thrown.");
      } catch (error: any) {
        expect(error.message).to.include("address mismatch");
      }
    });
  });
});

// Helper Functions
function convertEtherToWei(etherAmount: string | number | bigint): bigint {
  const weiString = web3.utils.toWei(etherAmount.toString(), "ether");
  return BigInt(weiString);
}

function convertMinutesToSeconds(minutes: number): number {
  return minutes * 60;
}
