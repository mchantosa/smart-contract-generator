import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const UtilsModule = buildModule("UtilsModule", (m) => {
  const utils = m.contract("Utils");
  return { utils };
});

export default UtilsModule;
