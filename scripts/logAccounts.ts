const hre = require("hardhat");
async function logAccounts() {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
}

logAccounts().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
