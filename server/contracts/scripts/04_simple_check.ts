import { ethers } from "ethers";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env.test") });

async function checkFactory() {
  const rpcUrl = process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology/";
  const factoryAddress = process.env.MUSICIAN_TOKEN_FACTORY_ADDRESS;

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/MusicianTokenFactory.sol/MusicianTokenFactory.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));

  const factory = new ethers.Contract(factoryAddress, artifact.abi, provider);

  console.log("Calling getImplementation()...");
  try {
    const impl = await factory.getImplementation();
    console.log(`✅ Implementation: ${impl}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

checkFactory().catch(console.error);
