import { ethers } from "ethers";
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env.test") });

async function verifyContracts() {
  console.log("🔍 Verifying deployed contracts...\n");

  const rpcUrl = process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology/";
  const privateKey = process.env.SERVICE_WALLET_PRIVATE_KEY;
  const implementationAddress = process.env.MUSICIAN_TOKEN_IMPLEMENTATION_ADDRESS;
  const factoryAddress = process.env.MUSICIAN_TOKEN_FACTORY_ADDRESS;

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log(`📋 Account: ${wallet.address}`);
  console.log(`📌 Implementation: ${implementationAddress}`);
  console.log(`📌 Factory: ${factoryAddress}\n`);

  // Check implementation contract code
  console.log("1️⃣ Checking implementation contract code...");
  const implCode = await provider.getCode(implementationAddress);
  if (implCode === "0x") {
    console.log("❌ Implementation contract has no code!");
    process.exit(1);
  }
  console.log(`✅ Implementation contract exists (${implCode.length} bytes)\n`);

  // Check factory contract code
  console.log("2️⃣ Checking factory contract code...");
  const factoryCode = await provider.getCode(factoryAddress);
  if (factoryCode === "0x") {
    console.log("❌ Factory contract has no code!");
    process.exit(1);
  }
  console.log(`✅ Factory contract exists (${factoryCode.length} bytes)\n`);

  // Try to call factory's tokenImplementation() function
  console.log("3️⃣ Checking factory's implementation address storage...");
  const factoryABI = [
    "function tokenImplementation() view returns (address)",
    "function deployToken(string memory name, string memory symbol, uint256 initialSupply) returns (address)"
  ];

  const factory = new ethers.Contract(factoryAddress, factoryABI, provider);

  try {
    const storedImpl = await factory.tokenImplementation();
    console.log(`✅ Factory's stored implementation: ${storedImpl}`);

    if (storedImpl.toLowerCase() === implementationAddress.toLowerCase()) {
      console.log("✅ Implementation address matches!\n");
    } else {
      console.log(`❌ Mismatch! Expected: ${implementationAddress}, Got: ${storedImpl}\n`);
    }
  } catch (error) {
    console.log(`❌ Failed to call tokenImplementation(): ${error.message}\n`);
  }

  // Try to estimate gas for deployToken call
  console.log("4️⃣ Attempting to estimate gas for deployToken call...");
  try {
    const gasEstimate = await factory.deployToken.estimateGas(
      "Test Token",
      "TEST",
      ethers.parseEther("1000000"),
      { from: wallet.address }
    );
    console.log(`✅ Gas estimate successful: ${gasEstimate.toString()}\n`);
  } catch (error) {
    console.log(`❌ Gas estimation failed: ${error.message}`);

    // Try to decode the error
    if (error.data) {
      console.log(`Error data: ${error.data}`);

      // Try to get more details from the error
      if (error.reason) {
        console.log(`Error reason: ${error.reason}`);
      }
    }
    console.log();
  }

  console.log("=".repeat(70));
  console.log("✨ Verification complete!");
}

verifyContracts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error.message);
    process.exit(1);
  });
