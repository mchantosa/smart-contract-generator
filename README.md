# Sample Hardhat Project

This project showcases a basic Hardhat setup, including a sample contract, a test suite for the contract, and an Ignition module for contract deployment.

## Features

- **Sample Contract:** Includes a sample smart contract to demonstrate basic functionality.
- **Contract Testing:** Comes with tests for verifying the contract’s behavior.
- **Deployment with Ignition:** Utilizes the Hardhat Ignition module to deploy the contract.

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
- **Run the contract tests:**
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
