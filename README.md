# Sample Hardhat Project

This project showcases a basic Hardhat setup, including a sample contract, a test suite for the contract, and an Ignition module for contract deployment.

## Features

- **Sample Contract:** Includes a sample smart contract to demonstrate basic functionality.
- **Contract Testing:** Comes with tests for verifying the contract’s behavior.
- **Deployment with Ignition:** Utilizes the Hardhat Ignition module to deploy the contract.

## API Key Dependencies

This project requires several API keys for various services. Ensure you have the following environment variables configured:

- **ETHERSCAN_API_KEY:** Used to interact with the Etherscan API for verifying and interacting with smart contracts on the Ethereum blockchain. You can get your API key from [Etherscan](https://etherscan.io/).

  ```bash
  npx hardhat vars set ETHERSCAN_API_KEY
  ```

- **DEV_PRIVATE_KEY:** The private key for the development account used in your Hardhat local environment. This key is used to deploy contracts and interact with the blockchain locally.

  ```bash
  npx hardhat vars set DEV_PRIVATE_KEY
  ```

- **INFURA_API_KEY:** Used to connect to the Ethereum network via Infura. This key allows you to interact with Ethereum nodes and access the network for development and deployment purposes. Obtain your API key from [Infura](https://www.infura.io/).

  ```bash
  npx hardhat vars set INFURA_API_KEY
  ```

## Getting Started

To get started with this project, you can try out some of the following tasks:

### Help and Commands

- **Show available Hardhat tasks and options:**
  ```shell
  npx hardhat help
  ```
- **Run the contract tests:**
  ```shell
  npx hardhat test
  ```
- **Start a local Hardhat node for testing:**
  ```shell
  npx hardhat node
  ```
- **Deploy the sample contract using the Ignition module:**
  ```shell
  npx hardhat ignition deploy ./ignition/modules/Crowdfunding.ts --network localhost
  ```
- **Deploy Utils:**
  ```shell
  npx hardhat run scripts/deployUtils.ts --network localhost
  ```

## Additional Resources

- **Hardhat Documentation:** [Get started with Hardhat](https://hardhat.org/getting-started) to learn about its features and setup.
- **Hardhat Ignition Documentation:** [Deploy contracts with Ignition](https://hardhat.org/docs/ignition) for guidance on using the Ignition module.
- **Hardhat GitHub Issues:** [Community support](https://github.com/NomicFoundation/hardhat/issues) for reporting issues and finding solutions.
- **Hardhat Discussion Forum:** [Join the discussion](https://forum.nomicfoundation.com/c/hardhat/) for questions and community advice.

## Troubleshooting

If you encounter any issues or need further assistance, consult the resources listed above or seek help from the community forums.

Feel free to customize this setup according to your project needs.
