import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.test explicitly
dotenv.config({ path: path.join(__dirname, "../.env.test") });

/**
 * T020: Deploy MusicianTokenFactory to Ethereum Sepolia
 */
async function deployMusicianTokenFactory() {
  console.log("🚀 Starting MusicianTokenFactory deployment to Ethereum Sepolia...\n");

  // Setup provider and wallet
  const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/";
  const privateKey = process.env.SERVICE_WALLET_PRIVATE_KEY;
  const implementationAddress = process.env.MUSICIAN_TOKEN_IMPLEMENTATION_ADDRESS;

  if (!privateKey) {
    throw new Error("❌ SERVICE_WALLET_PRIVATE_KEY not found in .env.test");
  }

  if (!implementationAddress || implementationAddress === "") {
    throw new Error(
      "❌ MUSICIAN_TOKEN_IMPLEMENTATION_ADDRESS not found in .env.test. Please run T019 first."
    );
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log(`📋 Deploying from account: ${wallet.address}`);

  // Check balance
  const balance = await provider.getBalance(wallet.address);
  const balanceInEth = ethers.formatEther(balance);
  console.log(`💰 Account balance: ${balanceInEth} ETH\n`);

  if (parseFloat(balanceInEth) < 0.01) {
    throw new Error(
      "❌ Insufficient ETH balance. Please request test ETH from Sepolia faucet: https://sepoliafaucet.com/"
    );
  }

  // Verify implementation address is valid
  console.log(`📌 Using implementation address: ${implementationAddress}\n`);
  const implementationCode = await provider.getCode(implementationAddress);
  if (implementationCode === "0x") {
    throw new Error(
      `❌ Implementation address ${implementationAddress} has no code. Invalid or not deployed.`
    );
  }

  // Load contract ABI from artifacts
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/MusicianTokenFactory.sol/MusicianTokenFactory.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));

  // Deploy contract
  console.log("⏳ Deploying MusicianTokenFactory contract...");
  const contractFactory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const factory = await contractFactory.deploy(implementationAddress);

  await factory.deploymentTransaction()?.wait();
  const factoryAddress = await factory.getAddress();

  console.log(`✅ MusicianTokenFactory deployed!`);
  console.log(`   Contract address: ${factoryAddress}\n`);

  // Verify deployment
  console.log("🔍 Verifying deployment...");
  const code = await provider.getCode(factoryAddress);
  if (code === "0x") {
    throw new Error("❌ Factory deployment verification failed");
  }
  console.log(`   Contract code verified ✓\n`);

  // Update .env.test with the deployment address
  const envPath = path.join(__dirname, "../.env.test");
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
  console.log(`   1. Create MongoDB schema (T021-T023)`);
  console.log(`   2. Setup Express backend (T024-T030)\n`);

  return factoryAddress;
}

// Run deployment
deployMusicianTokenFactory()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  });
