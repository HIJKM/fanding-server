import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

/**
 * T020: Deploy MusicianTokenFactory to Polygon Amoy
 *
 * This script deploys the MusicianTokenFactory contract which uses EIP-1167 Clones
 * to efficiently deploy MusicianToken instances for each musician.
 *
 * Prerequisites:
 * - T019: MusicianToken implementation must be deployed
 * - .env.test must have MUSICIAN_TOKEN_IMPLEMENTATION_ADDRESS set
 *
 * Expected output:
 * - Deployed factory contract address
 * - Updated .env.test with MUSICIAN_TOKEN_FACTORY_ADDRESS
 */
async function deployMusicianTokenFactory() {
  console.log("🚀 Starting MusicianTokenFactory deployment to Polygon Amoy...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`📋 Deploying from account: ${deployer.address}`);

  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceInMatic = ethers.formatEther(balance);
  console.log(`💰 Account balance: ${balanceInMatic} MATIC\n`);

  if (parseFloat(balanceInMatic) < 0.01) {
    throw new Error(
      "❌ Insufficient MATIC balance. Please request test MATIC from Polygon Amoy faucet: https://faucet.polygon.technology/"
    );
  }

  // Get implementation address from .env.test
  const implementationAddress = process.env.MUSICIAN_TOKEN_IMPLEMENTATION_ADDRESS;

  if (!implementationAddress || implementationAddress === "") {
    throw new Error(
      "❌ MUSICIAN_TOKEN_IMPLEMENTATION_ADDRESS not found in .env.test. Please run T019 first:\n" +
        "   npx hardhat run scripts/01_deploy_musician_token.ts --network amoy"
    );
  }

  console.log(`📌 Using implementation address: ${implementationAddress}\n`);

  // Verify implementation address is valid (has code)
  const implementationCode = await ethers.provider.getCode(implementationAddress);
  if (implementationCode === "0x") {
    throw new Error(
      `❌ Implementation address ${implementationAddress} has no code. Invalid address or not deployed.`
    );
  }

  // Deploy MusicianTokenFactory
  console.log("⏳ Deploying MusicianTokenFactory contract...");
  const Factory = await ethers.getContractFactory("MusicianTokenFactory");
  const factory = await Factory.deploy(implementationAddress);

  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  console.log(`✅ MusicianTokenFactory deployed!`);
  console.log(`   Contract address: ${factoryAddress}\n`);

  // Verify deployment
  console.log("🔍 Verifying deployment...");
  const storedImplementation = await factory.getImplementation();
  console.log(
    `   Implementation address: ${storedImplementation} (should match: ${implementationAddress})`
  );

  const deployedTokenCount = await factory.getDeployedTokenCount();
  console.log(`   Deployed token count: ${deployedTokenCount} (should be 0)\n`);

  // Update .env.test with the deployment address
  const envPath = path.join(process.cwd(), ".env.test");
  let envContent = fs.readFileSync(envPath, "utf-8");

  envContent = envContent.replace(
    /MUSICIAN_TOKEN_FACTORY_ADDRESS=.*/,
    `MUSICIAN_TOKEN_FACTORY_ADDRESS=${factoryAddress}`
  );

  fs.writeFileSync(envPath, envContent, "utf-8");
  console.log("📝 Updated .env.test with MUSICIAN_TOKEN_FACTORY_ADDRESS\n");

  // Display deployment summary
  console.log("=" + "=".repeat(69));
  console.log("✨ MusicianTokenFactory deployment complete!");
  console.log("=" + "=".repeat(69));
  console.log(`\n📌 Deployment Summary:`);
  console.log(`   Implementation: ${implementationAddress}`);
  console.log(`   Factory: ${factoryAddress}\n`);
  console.log(`📌 Next steps:`);
  console.log(`   1. Run tests to verify factory functionality:`);
  console.log(`      npm run test\n`);
  console.log(`   2. Continue with T021: Create MongoDB schema\n`);

  return factoryAddress;
}

// Run deployment
deployMusicianTokenFactory()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
