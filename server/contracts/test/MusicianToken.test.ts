import { expect } from "chai";
import { ethers } from "hardhat";
import { MusicianToken } from "../typechain-types";

describe("MusicianToken", () => {
  let token: MusicianToken;
  let owner: any;
  let musician: any;
  let user1: any;

  const TOKEN_NAME = "테스트 Token";
  const TOKEN_SYMBOL = "TEST";
  const TOTAL_SUPPLY = ethers.parseEther("10000");
  const MUSICIAN_ALLOCATION = TOTAL_SUPPLY; // 100% 모두 뮤지션에게

  beforeEach(async () => {
    [owner, musician, user1] = await ethers.getSigners();

    const TokenFactory = await ethers.getContractFactory("MusicianToken");
    token = await TokenFactory.deploy();
    await token.waitForDeployment();
  });

  describe("초기화 (Initialization)", () => {
    it("토큰이 초기화되지 않은 상태로 배포되어야 함", async () => {
      expect(await token.isInitialized()).to.be.false;
    });

    it("initialize 함수로 토큰을 초기화할 수 있어야 함", async () => {
      await token.initialize(TOKEN_NAME, TOKEN_SYMBOL, musician.address);
      expect(await token.isInitialized()).to.be.true;
    });

    it("뮤지션 주소가 올바르게 설정되어야 함", async () => {
      await token.initialize(TOKEN_NAME, TOKEN_SYMBOL, musician.address);
      expect(await token.getMusicianAddress()).to.equal(musician.address);
    });

    it("이미 초기화된 토큰은 다시 초기화할 수 없어야 함", async () => {
      await token.initialize(TOKEN_NAME, TOKEN_SYMBOL, musician.address);
      await expect(
        token.initialize(TOKEN_NAME, TOKEN_SYMBOL, musician.address)
      ).to.be.revertedWith("Token already initialized");
    });

    it("유효하지 않은 주소로 초기화할 수 없어야 함", async () => {
      await expect(
        token.initialize(TOKEN_NAME, TOKEN_SYMBOL, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid musician address");
    });
  });

  describe("토큰 할당 (Token Allocation)", () => {
    beforeEach(async () => {
      await token.initialize(TOKEN_NAME, TOKEN_SYMBOL, musician.address);
    });

    it("뮤지션이 100% 토큰을 할당받아야 함", async () => {
      const musicianBalance = await token.balanceOf(musician.address);
      expect(musicianBalance).to.equal(MUSICIAN_ALLOCATION);
    });

    it("전체 공급량이 10,000 토큰이어야 함", async () => {
      const totalSupply = await token.totalSupply();
      expect(totalSupply).to.equal(TOTAL_SUPPLY);
    });

    it("뮤지션이 모든 토큰을 가져야 함", async () => {
      const musicianBalance = await token.balanceOf(musician.address);
      const totalSupply = await token.totalSupply();
      expect(musicianBalance).to.equal(totalSupply);
    });
  });

  describe("ERC20 표준 기능 (ERC20 Standard Functions)", () => {
    beforeEach(async () => {
      await token.initialize(TOKEN_NAME, TOKEN_SYMBOL, musician.address);
    });

    it("토큰 전송이 가능해야 함", async () => {
      const transferAmount = ethers.parseEther("100");
      await token
        .connect(musician)
        .transfer(user1.address, transferAmount);
      expect(await token.balanceOf(user1.address)).to.equal(transferAmount);
    });

    it("허용된 토큰만 전송할 수 있어야 함 (approve/transferFrom)", async () => {
      const transferAmount = ethers.parseEther("100");
      await token
        .connect(musician)
        .approve(user1.address, transferAmount);
      await token
        .connect(user1)
        .transferFrom(musician.address, user1.address, transferAmount);
      expect(await token.balanceOf(user1.address)).to.equal(transferAmount);
    });

    it("decimals이 18이어야 함", async () => {
      expect(await token.decimals()).to.equal(18);
    });

    it("토큰 메타데이터를 조회할 수 있어야 함", async () => {
      const [name, symbol, decimals, totalSupply] =
        await token.getTokenMetadata();
      expect(name).to.equal(TOKEN_NAME);
      expect(symbol).to.equal(TOKEN_SYMBOL);
      expect(decimals).to.equal(18);
      expect(totalSupply).to.equal(TOTAL_SUPPLY);
    });
  });

  describe("토큰 구매 (Token Purchase)", () => {
    beforeEach(async () => {
      await token.initialize(TOKEN_NAME, TOKEN_SYMBOL, musician.address);
    });

    it("토큰 가격을 조회할 수 있어야 함", async () => {
      const price = await token.getPrice();
      expect(price).to.equal(ethers.parseEther("0.01")); // 0.01 MATIC
    });

    it("뮤지션이 충분한 토큰을 가지고 있을 때 구매할 수 있어야 함", async () => {
      const amount = 100n; // 100 tokens
      const price = await token.getPrice();
      const totalCost = price * amount;

      const balanceBefore = await token.balanceOf(user1.address);

      await token.connect(user1).buyToken(amount, { value: totalCost });

      const balanceAfter = await token.balanceOf(user1.address);
      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("100"));
    });

    it("충분하지 않은 MATIC으로는 구매할 수 없어야 함", async () => {
      const amount = 100n;
      const insufficientValue = ethers.parseEther("0.0001"); // 너무 적음

      await expect(
        token.connect(user1).buyToken(amount, { value: insufficientValue })
      ).to.be.revertedWith("Insufficient payment");
    });
  });
});
