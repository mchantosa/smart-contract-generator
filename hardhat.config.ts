import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { vars } from "hardhat/config";

const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");
const DEV_PRIVATE_KEY = vars.get("DEV_PRIVATE_KEY");
const INFURA_API_KEY = vars.get("INFURA_API_KEY");

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545", // Default local Hardhat network
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`, // Replace with your Infura project ID or another provider
      accounts: [`0x${DEV_PRIVATE_KEY}`], // Private key for deploying on Sepolia
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`, // Replace with your Infura project ID or another provider
      accounts: [`0x${DEV_PRIVATE_KEY}`], // Private key for deploying on Ethereum mainnet
    },
  },
};

export default config;
