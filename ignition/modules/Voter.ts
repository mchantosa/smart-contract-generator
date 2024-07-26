import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VoterModule = buildModule("VoterModule", (m) => {
  const voter = m.contract("Voter", [["Coffee", "Tea", "Kombucha"]]);
  return { voter };
});

export default VoterModule;
