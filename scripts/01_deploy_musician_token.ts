import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

/**
 * T019: Deploy MusicianToken implementation contract to Polygon Amoy
 *
 * This script deploys the MusicianToken contract (implementation for proxy pattern).
 * The contract is deployed once and used by MusicianTokenFactory via EIP-1167 Clones.
 *
 * Expected output:
 * - Deployed implementation contract address
 * - Updated .env.test with MUSICIAN_TOKEN_IMPLEMENTATION_ADDRESS
 */
async function deployMusicianToken() {
  console.log("🚀 Starting MusicianToken implementation deployment to Polygon Amoy...\n");

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

  // Deploy MusicianToken implementation
  console.log("⏳ Deploying MusicianToken implementation contract...");
  const MusicianToken = await ethers.getContractFactory("MusicianToken");
  const implementation = await MusicianToken.deploy();

  await implementation.waitForDeployment();
  const implementationAddress = await implementation.getAddress();

  console.log(`✅ MusicianToken implementation deployed!`);
  console.log(`   Contract address: ${implementationAddress}\n`);

  // Verify deployment
  console.log("🔍 Verifying deployment...");
  const isInitialized = await implementation.isInitialized();
  console.log(`   Initialized: ${isInitialized} (should be false)`);

  const decimals = await implementation.decimals();
  console.log(`   Decimals: ${decimals} (should be 18)\n`);

  // Update .env.test with the deployment address
  const envPath = path.join(process.cwd(), ".env.test");
  let envContent = fs.readFileSync(envPath, "utf-8");

  envContent = envContent.replace(
    /MUSICIAN_TOKEN_IMPLEMENTATION_ADDRESS=.*/,
    `MUSICIAN_TOKEN_IMPLEMENTATION_ADDRESS=${implementationAddress}`
  );

  fs.writeFileSync(envPath, envContent, "utf-8");
  console.log("📝 Updated .env.test with MUSICIAN_TOKEN_IMPLEMENTATION_ADDRESS\n");

  console.log("=" + "=".repeat(69));
  console.log("✨ MusicianToken implementation deployment complete!");
  console.log("=" + "=".repeat(69));
  console.log(`\n📌 Next step: Deploy MusicianTokenFactory with implementation address:`);
  console.log(`   npx hardhat run scripts/02_deploy_musician_token_factory.ts --network amoy\n`);

  return implementationAddress;
}

// Run deployment
deployMusicianToken()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
