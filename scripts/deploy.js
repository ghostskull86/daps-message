
const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

async function main() {
  const ChatDApp = await ethers.getContractFactory("ChatDApp");
  const chat = await upgrades.deployProxy(ChatDApp, [], { initializer: 'initialize' });
  await chat.waitForDeployment();

  console.log("ChatDApp deployed to:", await chat.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
