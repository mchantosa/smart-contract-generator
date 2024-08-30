import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CrowdfundingModule = buildModule("CrowdfundingModule", (m) => {
  // Deploy the Utils library first
  const utils = m.contract("Utils");

  // Deploy the Crowdfunding contract with the library linked
  const crowdfunding = m.contract(
    "Crowdfunding",
    [
      "An awesome .1 ETH campaign", // campaignName
      0.1, // ether (targetAmount)
      10, // duration (minutes from now)
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // beneficiary
    ],
    {
      libraries: {
        Utils: utils,
      },
    }
  );

  return { utils, crowdfunding };
});

export default CrowdfundingModule;
