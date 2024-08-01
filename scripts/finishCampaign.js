require("dotenv").config(); // For loading environment variables
const { JsonRpcProvider, Wallet, Contract } = require("ethers");

// Your contract address
const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

const contractABI = [
  {
    inputs: [],
    name: "finishedCrowdfunding",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const provider = new JsonRpcProvider("http://127.0.0.1:8545");
const privateKey = process.env.PRIVATE_KEY;
const wallet = new Wallet(privateKey, provider);
const contract = new Contract(contractAddress, contractABI, wallet);

async function finishCampaign() {
  try {
    console.log("Sending transaction to finish campaign...");
    const tx = await contract.finishedCrowdfunding();
    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction mined:", receipt.transactionHash);
    console.log("Campaign finished successfully.");
  } catch (error) {
    console.error("Error executing finishedCrowdfunding:", error);
  }
}

finishCampaign();
