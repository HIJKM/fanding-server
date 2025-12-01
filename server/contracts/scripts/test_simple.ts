import { ethers } from "hardhat";

async function main() {
  console.log("\n========================================");
  console.log("🧪 MusicianToken Local Test");
  console.log("========================================\n");

  // Get signers
  const [owner, musician, user1] = await ethers.getSigners();

  console.log("📋 테스트 계정:");
  console.log(`   Owner: ${owner.address}`);
  console.log(`   Musician: ${musician.address}`);
  console.log(`   User1: ${user1.address}\n`);

  // Deploy token
  console.log("1️⃣ MusicianToken 배포 중...");
  const MusicianToken = await ethers.getContractFactory("MusicianToken");
  const token = await MusicianToken.deploy();
  await token.waitForDeployment();

  console.log(`   ✅ 배포 완료: ${await token.getAddress()}\n`);

  // Test 1: Initialize
  console.log("2️⃣ 토큰 초기화 중...");
  let isInitialized = await token.isInitialized();
  console.log(`   초기화 전: ${isInitialized}`);

  await token.initialize("뮤지션 Token", "MUS", musician.address);

  isInitialized = await token.isInitialized();
  console.log(`   초기화 후: ${isInitialized}`);
  console.log(`   ✅ 초기화 성공!\n`);

  // Test 2: Token allocation
  console.log("3️⃣ 토큰 할당 확인...");
  const musicianBalance = await token.balanceOf(musician.address);
  const totalSupply = await token.totalSupply();

  console.log(`   뮤지션 잔액: ${ethers.formatEther(musicianBalance)} tokens`);
  console.log(`   전체 공급량: ${ethers.formatEther(totalSupply)} tokens`);

  if (musicianBalance === totalSupply) {
    console.log(`   ✅ 뮤지션이 모든 토큰을 소유!\n`);
  } else {
    console.log(`   ❌ 토큰 할당 오류!\n`);
  }

  // Test 3: Get price
  console.log("4️⃣ 토큰 가격 확인...");
  const price = await token.getPrice();
  console.log(`   가격: ${ethers.formatEther(price)} MATIC (0.01 MATIC)\n`);

  // Test 4: Buy token
  console.log("5️⃣ 토큰 구매 테스트...");
  const amount = 100n; // 100 tokens
  const totalCost = price * amount;

  console.log(`   구매 수량: ${amount} tokens`);
  console.log(`   총 비용: ${ethers.formatEther(totalCost)} MATIC`);

  const user1BalanceBefore = await token.balanceOf(user1.address);
  console.log(`   구매 전 user1 잔액: ${ethers.formatEther(user1BalanceBefore)} tokens`);

  try {
    const buyTx = await token.connect(user1).buyToken(amount, { value: totalCost });
    const receipt = await buyTx.wait();
    console.log(`   트랜잭션: ${receipt?.hash}`);

    const user1BalanceAfter = await token.balanceOf(user1.address);
    console.log(`   구매 후 user1 잔액: ${ethers.formatEther(user1BalanceAfter)} tokens`);
    console.log(`   ✅ 토큰 구매 성공!\n`);
  } catch (error: any) {
    console.log(`   ❌ 토큰 구매 실패: ${error.message}\n`);
  }

  // Test 5: ERC20 transfer
  console.log("6️⃣ ERC20 전송 테스트...");
  const transferAmount = ethers.parseEther("50");

  console.log(`   전송 금액: ${ethers.formatEther(transferAmount)} tokens`);

  try {
    const transferTx = await token.connect(musician).transfer(owner.address, transferAmount);
    const receipt = await transferTx.wait();
    console.log(`   트랜잭션: ${receipt?.hash}`);

    const musicianBalanceAfter = await token.balanceOf(musician.address);
    const ownerBalanceAfter = await token.balanceOf(owner.address);

    console.log(`   전송 후 musician: ${ethers.formatEther(musicianBalanceAfter)} tokens`);
    console.log(`   전송 후 owner: ${ethers.formatEther(ownerBalanceAfter)} tokens`);
    console.log(`   ✅ 토큰 전송 성공!\n`);
  } catch (error: any) {
    console.log(`   ❌ 토큰 전송 실패: ${error.message}\n`);
  }

  // Test 6: Token metadata
  console.log("7️⃣ 토큰 메타데이터 확인...");
  try {
    const [name, symbol, decimals, supply] = await token.getTokenMetadata();
    console.log(`   이름: ${name}`);
    console.log(`   심볼: ${symbol}`);
    console.log(`   Decimals: ${decimals}`);
    console.log(`   공급량: ${ethers.formatEther(supply)} tokens`);
    console.log(`   ✅ 메타데이터 조회 성공!\n`);
  } catch (error: any) {
    console.log(`   ❌ 메타데이터 조회 실패: ${error.message}\n`);
  }

  console.log("========================================");
  console.log("✨ 모든 테스트 완료!");
  console.log("========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 테스트 실패:", error);
    process.exit(1);
  });
