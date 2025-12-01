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
 * T019: Deploy MusicianToken implementation contract to Ethereum Sepolia
 */
async function deployMusicianToken() {
  console.log("🚀 Starting MusicianToken implementation deployment to Ethereum Sepolia...\n");

  // Setup provider and wallet
  const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/";
  const privateKey = process.env.SERVICE_WALLET_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("❌ SERVICE_WALLET_PRIVATE_KEY not found in .env.test");
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

  // Load contract ABI from artifacts
  const artifactPath = path.join(__dirname, "../artifacts/contracts/MusicianToken.sol/MusicianToken.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));

  // Deploy contract
  console.log("⏳ Deploying MusicianToken implementation contract...");
  const contractFactory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const implementation = await contractFactory.deploy();

  await implementation.deploymentTransaction()?.wait();
  const implementationAddress = await implementation.getAddress();

  console.log(`✅ MusicianToken implementation deployed!`);
  console.log(`   Contract address: ${implementationAddress}\n`);

  // Verify deployment
  console.log("🔍 Verifying deployment...");
  const code = await provider.getCode(implementationAddress);
  if (code === "0x") {
    throw new Error("❌ Contract deployment verification failed");
  }
  console.log(`   Contract code verified ✓\n`);

  // Update .env.test with the deployment address
  const envPath = path.join(__dirname, "../.env.test");
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
  console.log(`   npx tsx scripts/02_deploy_musician_token_factory.ts\n`);

  return implementationAddress;
}

// Run deployment
deployMusicianToken()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  });
