import { ethers } from "ethers";
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env.test") });

async function testDeployedContracts() {
  console.log("\n========================================");
  console.log("🧪 Deployed Contracts Test");
  console.log("========================================\n");

  const rpcUrl = process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology/";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const implementationAddress = process.env.MUSICIAN_TOKEN_IMPLEMENTATION_ADDRESS;

  console.log("📋 설정:");
  console.log(`   RPC: ${rpcUrl}`);
  console.log(`   Implementation: ${implementationAddress}\n`);

  try {
    // Check if implementation contract exists
    console.log("1️⃣ Implementation 계약 확인...");
    const code = await provider.getCode(implementationAddress);
    if (code === "0x") {
      console.log("   ❌ 계약이 배포되지 않았습니다!\n");
      return;
    }
    console.log("   ✅ 계약이 배포됨\n");

    // Load contract ABI
    const abi = [
      "function initialize(string name_, string symbol_, address musicianAddress_) external",
      "function isInitialized() external view returns (bool)",
      "function balanceOf(address account) external view returns (uint256)",
      "function totalSupply() external view returns (uint256)",
      "function getPrice() external view returns (uint256)",
      "function buyToken(uint256 amount) external payable returns (bool)",
      "function transfer(address to, uint256 amount) external returns (bool)",
      "function musicianAddress() external view returns (address)",
      "function getTokenMetadata() external view returns (string, string, uint8, uint256)",
      "event TokenInitialized(address indexed musicianAddress, string name, string symbol, uint256 musicianAllocation)",
      "event TokenPurchased(address indexed buyer, uint256 amount, uint256 totalCost, uint256 timestamp)",
    ];

    const contract = new ethers.Contract(implementationAddress, abi, provider);

    // Test 1: Check initialization status
    console.log("2️⃣ 초기화 상태 확인...");
    const isInitialized = await contract.isInitialized();
    console.log(`   초기화 여부: ${isInitialized}`);
    if (!isInitialized) {
      console.log("   ℹ️ 아직 초기화되지 않음 (proxy pattern 사용)\n");
    } else {
      console.log("   ✅ 초기화됨\n");
    }

    // Test 2: Check token metadata
    console.log("3️⃣ 토큰 메타데이터...");
    try {
      const [name, symbol, decimals, supply] = await contract.getTokenMetadata();
      console.log(`   이름: ${name}`);
      console.log(`   심볼: ${symbol}`);
      console.log(`   Decimals: ${decimals}`);
      console.log(`   공급량: ${ethers.formatEther(supply)} tokens\n`);
    } catch (e) {
      console.log("   ℹ️ 메타데이터 조회 불가 (초기화되지 않음)\n");
    }

    // Test 3: Check price
    console.log("4️⃣ 토큰 가격...");
    try {
      const price = await contract.getPrice();
      console.log(`   가격: ${ethers.formatEther(price)} MATIC\n`);
    } catch (e: any) {
      console.log(`   ❌ 가격 조회 실패: ${e.reason || e.message}\n`);
    }

    // Test 4: Check balance
    console.log("5️⃣ 계약 잔액...");
    const balance = await provider.getBalance(implementationAddress);
    console.log(`   MATIC 잔액: ${ethers.formatEther(balance)} MATIC`);
    const totalSupply = await contract.totalSupply();
    console.log(`   토큰 공급량: ${ethers.formatEther(totalSupply)} tokens\n`);

    console.log("========================================");
    console.log("✨ 계약 정보 확인 완료!");
    console.log("========================================\n");
    console.log("📝 주의사항:");
    console.log("   - Implementation 계약은 직접 초기화하지 않습니다");
    console.log("   - Factory에서 clone을 만들 때 각 clone이 초기화됩니다");
    console.log("   - Polygon Amoy faucet에서 MATIC을 받으세요");
    console.log("   - 그 후 frontend에서 'Deploy Token'을 클릭하세요\n");
  } catch (error: any) {
    console.error("❌ 에러:", error.message);
  }
}

testDeployedContracts();
