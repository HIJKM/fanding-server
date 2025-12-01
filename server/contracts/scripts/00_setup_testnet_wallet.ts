import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

/**
 * Helper script to set up a testnet wallet for deployment
 *
 * Usage:
 *   npx ts-node scripts/00_setup_testnet_wallet.ts [--generate]
 *
 * Options:
 *   --generate: Create a new random wallet
 *   (no option): Use existing wallet from .env.test
 */

async function setupTestnetWallet() {
  const envPath = path.join(process.cwd(), ".env.test");
  let envContent = fs.readFileSync(envPath, "utf-8");

  const generateFlag = process.argv.includes("--generate");

  if (generateFlag) {
    console.log("🔑 Generating new test wallet...\n");

    // Generate new random wallet
    const wallet = ethers.Wallet.createRandom();

    console.log("✅ New wallet generated!");
    console.log(`\n📌 Wallet Details:`);
    console.log(`   Address: ${wallet.address}`);
    console.log(`   Private Key: ${wallet.privateKey}\n`);

    // Update .env.test
    envContent = envContent.replace(
      /SERVICE_WALLET_PRIVATE_KEY=.*/,
      `SERVICE_WALLET_PRIVATE_KEY=${wallet.privateKey}`
    );

    fs.writeFileSync(envPath, envContent, "utf-8");
    console.log("📝 Updated .env.test with SERVICE_WALLET_PRIVATE_KEY\n");

    console.log("=" + "=".repeat(69));
    console.log("⚠️  IMPORTANT: Next Steps");
    console.log("=" + "=".repeat(69));
    console.log(`\n1️⃣  Request test MATIC from Polygon Amoy Faucet:`);
    console.log(`    URL: https://faucet.polygon.technology/`);
    console.log(`    Paste this address: ${wallet.address}\n`);
    console.log(`2️⃣  Wait for MATIC to arrive (usually < 1 minute)\n`);
    console.log(`3️⃣  Deploy MusicianToken implementation:`);
    console.log(`    npx hardhat run scripts/01_deploy_musician_token.ts --network amoy\n`);

    return;
  }

  // Check if wallet is configured
  const privateKey = process.env.SERVICE_WALLET_PRIVATE_KEY;

  if (!privateKey || privateKey === "") {
    console.log("❌ SERVICE_WALLET_PRIVATE_KEY not configured in .env.test\n");
    console.log("📌 To generate a new wallet, run:");
    console.log(`   npx ts-node scripts/00_setup_testnet_wallet.ts --generate\n`);
    return;
  }

  // Load wallet from .env.test
  try {
    const wallet = new ethers.Wallet(privateKey);
    console.log("✅ Wallet loaded from .env.test\n");
    console.log("📌 Wallet Address: " + wallet.address);

    // Check balance on Amoy
    const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology/");
    const balance = await provider.getBalance(wallet.address);
    const balanceInMatic = ethers.formatEther(balance);

    console.log(`💰 Amoy Balance: ${balanceInMatic} MATIC\n`);

    if (parseFloat(balanceInMatic) < 0.01) {
      console.log("⚠️  Balance is low. Request more test MATIC:");
      console.log(`    URL: https://faucet.polygon.technology/`);
      console.log(`    Address: ${wallet.address}\n`);
    }
  } catch (error) {
    console.error("❌ Invalid private key in .env.test:", error);
    process.exit(1);
  }
}

setupTestnetWallet().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
