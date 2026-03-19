import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying VexLand with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "AVAX");

  const seasonPassPrice = ethers.parseEther("1.0");

  console.log("Deploying VexLand contract...");
  const VexLand = await ethers.getContractFactory("VexLand");
  const vexland = await VexLand.deploy(seasonPassPrice);

  await vexland.waitForDeployment();

  const contractAddress = await vexland.getAddress();
  console.log("");
  console.log("========================================");
  console.log("VexLand deployed successfully!");
  console.log("Contract address:", contractAddress);
  console.log("Season pass price:", ethers.formatEther(seasonPassPrice), "AVAX");
  console.log("========================================");
  console.log("");
  console.log("Next steps:");
  console.log(`1. Update your frontend .env: VITE_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("2. Verify the contract (optional):");
  console.log(`   npx hardhat verify --network fuji ${contractAddress} ${seasonPassPrice}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
