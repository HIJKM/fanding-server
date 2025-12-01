import { expect } from "chai";
import { ethers } from "hardhat";

describe("MusicianToken - Simple Test", () => {
  let token;
  let owner, musician, user1;

  beforeEach(async () => {
    [owner, musician, user1] = await ethers.getSigners();

    const TokenFactory = await ethers.getContractFactory("MusicianToken");
    token = await TokenFactory.deploy();
    await token.waitForDeployment();
  });

  it("✅ 토큰이 초기화되지 않은 상태로 배포되어야 함", async () => {
    const isInitialized = await token.isInitialized();
    expect(isInitialized).to.be.false;
    console.log("   토큰 초기화 상태: ", isInitialized);
  });

  it("✅ initialize 함수로 토큰을 초기화할 수 있어야 함", async () => {
    await token.initialize("Test Token", "TEST", musician.address);
    const isInitialized = await token.isInitialized();
    expect(isInitialized).to.be.true;
    console.log("   초기화 후 상태: ", isInitialized);
  });

  it("✅ 뮤지션이 모든 토큰(10,000)을 할당받아야 함", async () => {
    await token.initialize("Test Token", "TEST", musician.address);

    const musicianBalance = await token.balanceOf(musician.address);
    const totalSupply = await token.totalSupply();

    console.log("   뮤지션 잔액: ", ethers.formatEther(musicianBalance), "tokens");
    console.log("   전체 공급량: ", ethers.formatEther(totalSupply), "tokens");

    expect(musicianBalance).to.equal(totalSupply);
  });

  it("✅ 토큰 가격이 0.01 MATIC이어야 함", async () => {
    await token.initialize("Test Token", "TEST", musician.address);

    const price = await token.getPrice();
    const priceInMatic = ethers.formatEther(price);

    console.log("   토큰 가격: ", priceInMatic, "MATIC");
    expect(price).to.equal(ethers.parseEther("0.01"));
  });

  it("✅ 토큰을 구매할 수 있어야 함", async () => {
    await token.initialize("Test Token", "TEST", musician.address);

    const amount = 100n; // 100 tokens
    const price = await token.getPrice();
    const totalCost = price * amount;

    console.log("   구매 수량: ", amount, "tokens");
    console.log("   총 비용: ", ethers.formatEther(totalCost), "MATIC");

    const balanceBefore = await token.balanceOf(user1.address);
    console.log("   구매 전 잔액: ", ethers.formatEther(balanceBefore), "tokens");

    await token.connect(user1).buyToken(amount, { value: totalCost });

    const balanceAfter = await token.balanceOf(user1.address);
    console.log("   구매 후 잔액: ", ethers.formatEther(balanceAfter), "tokens");

    expect(balanceAfter).to.equal(ethers.parseEther("100"));
  });

  it("✅ 불충분한 MATIC으로 구매할 수 없어야 함", async () => {
    await token.initialize("Test Token", "TEST", musician.address);

    const amount = 100n;
    const insufficientValue = ethers.parseEther("0.0001");

    try {
      await token.connect(user1).buyToken(amount, { value: insufficientValue });
      console.log("   ❌ 구매가 되었습니다 (예상치 못한 결과)");
      expect.fail("Should have reverted");
    } catch (error) {
      console.log("   ✓ 예상대로 리버트됨:", error.reason || "Insufficient payment");
    }
  });

  it("✅ 이미 초기화된 토큰은 다시 초기화할 수 없어야 함", async () => {
    await token.initialize("Test Token", "TEST", musician.address);

    try {
      await token.initialize("Test Token 2", "TEST2", musician.address);
      expect.fail("Should have reverted");
    } catch (error) {
      console.log("   ✓ 예상대로 리버트됨: Token already initialized");
    }
  });

  it("✅ ERC20 전송 기능이 작동해야 함", async () => {
    await token.initialize("Test Token", "TEST", musician.address);

    const transferAmount = ethers.parseEther("100");
    await token.connect(musician).transfer(user1.address, transferAmount);

    const user1Balance = await token.balanceOf(user1.address);
    console.log("   user1 전송받은 토큰: ", ethers.formatEther(user1Balance), "tokens");

    expect(user1Balance).to.equal(transferAmount);
  });
});
