import { expect } from "chai";
import { ethers } from "hardhat";
import { MusicianTokenFactory, MusicianToken } from "../typechain-types";

describe("MusicianTokenFactory", () => {
  let factory: MusicianTokenFactory;
  let implementation: MusicianToken;
  let owner: any;
  let musician1: any;
  let musician2: any;
  let user: any;

  const TOKEN_NAME = "뮤지션 Token";
  const TOKEN_SYMBOL = "MSC";

  beforeEach(async () => {
    [owner, musician1, musician2, user] = await ethers.getSigners();

    // Implementation 컨트랙트 배포
    const TokenFactory = await ethers.getContractFactory("MusicianToken");
    implementation = await TokenFactory.deploy();
    await implementation.waitForDeployment();

    // Factory 컨트랙트 배포
    const FactoryFactory = await ethers.getContractFactory(
      "MusicianTokenFactory"
    );
    factory = await FactoryFactory.deploy(implementation.target);
    await factory.waitForDeployment();
  });

  describe("Factory 초기화 (Factory Initialization)", () => {
    it("Implementation 주소로 Factory를 초기화할 수 있어야 함", async () => {
      expect(await factory.getImplementation()).to.equal(implementation.target);
    });

    it("유효하지 않은 Implementation 주소로는 초기화할 수 없어야 함", async () => {
      const FactoryFactory = await ethers.getContractFactory(
        "MusicianTokenFactory"
      );
      await expect(
        FactoryFactory.deploy(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid implementation address");
    });
  });

  describe("토큰 배포 (Token Deployment)", () => {
    it("새로운 토큰을 배포할 수 있어야 함", async () => {
      const tx = await factory.deployToken(
        TOKEN_NAME,
        TOKEN_SYMBOL,
        musician1.address
      );
      await tx.wait();

      const tokenAddress = await factory.getMusicianToken(musician1.address);
      expect(tokenAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("배포된 토큰이 ERC20 표준을 따라야 함", async () => {
      await factory.deployToken(TOKEN_NAME, TOKEN_SYMBOL, musician1.address);

      const tokenAddress = await factory.getMusicianToken(musician1.address);
      const token = await ethers.getContractAt("MusicianToken", tokenAddress);

      expect(await token.isInitialized()).to.be.true;
      expect(await token.getMusicianAddress()).to.equal(musician1.address);
    });

    it("같은 뮤지션을 위해 두 번 배포할 수 없어야 함", async () => {
      await factory.deployToken(TOKEN_NAME, TOKEN_SYMBOL, musician1.address);

      await expect(
        factory.deployToken(TOKEN_NAME + "2", "SYM2", musician1.address)
      ).to.be.revertedWith("Token already deployed for this musician");
    });

    it("유효하지 않은 뮤지션 주소로 배포할 수 없어야 함", async () => {
      await expect(
        factory.deployToken(TOKEN_NAME, TOKEN_SYMBOL, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid musician address");
    });

    it("배포된 토큰이 Factory에서 생성되었음을 확인할 수 있어야 함", async () => {
      await factory.deployToken(TOKEN_NAME, TOKEN_SYMBOL, musician1.address);
      const tokenAddress = await factory.getMusicianToken(musician1.address);

      expect(await factory.isTokenDeployedByFactory(tokenAddress)).to.be.true;
    });
  });

  describe("토큰 조회 (Token Lookup)", () => {
    beforeEach(async () => {
      await factory.deployToken(TOKEN_NAME, TOKEN_SYMBOL, musician1.address);
      await factory.deployToken(
        TOKEN_NAME + "2",
        "SYM2",
        musician2.address
      );
    });

    it("뮤지션의 토큰 주소를 조회할 수 있어야 함", async () => {
      const tokenAddress = await factory.getMusicianToken(musician1.address);
      expect(tokenAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("배포되지 않은 뮤지션은 0x0 주소를 반환해야 함", async () => {
      const tokenAddress = await factory.getMusicianToken(user.address);
      expect(tokenAddress).to.equal(ethers.ZeroAddress);
    });

    it("배포된 토큰 수를 조회할 수 있어야 함", async () => {
      const count = await factory.getDeployedTokenCount();
      expect(count).to.equal(2);
    });

    it("페이지네이션으로 배포된 토큰 목록을 조회할 수 있어야 함", async () => {
      const tokens = await factory.getDeployedTokens(0, 10);
      expect(tokens.length).to.equal(2);
      expect(tokens[0]).to.not.equal(ethers.ZeroAddress);
      expect(tokens[1]).to.not.equal(ethers.ZeroAddress);
    });

    it("오프셋이 범위를 벗어나면 오류가 발생해야 함", async () => {
      await expect(
        factory.getDeployedTokens(10, 10)
      ).to.be.revertedWith("Offset out of bounds");
    });
  });

  describe("Implementation 업데이트 (Implementation Update)", () => {
    it("Owner만 Implementation을 업데이트할 수 있어야 함", async () => {
      const TokenFactory = await ethers.getContractFactory("MusicianToken");
      const newImpl = await TokenFactory.deploy();
      await newImpl.waitForDeployment();

      await factory.setImplementation(newImpl.target);
      expect(await factory.getImplementation()).to.equal(newImpl.target);
    });

    it("Owner가 아닌 사용자는 Implementation을 업데이트할 수 없어야 함", async () => {
      const TokenFactory = await ethers.getContractFactory("MusicianToken");
      const newImpl = await TokenFactory.deploy();
      await newImpl.waitForDeployment();

      await expect(
        factory.connect(user).setImplementation(newImpl.target)
      ).to.be.revertedWithCustomError(factory, "OwnableUnauthorizedAccount");
    });

    it("유효하지 않은 주소로 Implementation을 업데이트할 수 없어야 함", async () => {
      await expect(
        factory.setImplementation(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid implementation address");
    });
  });

  describe("토큰 메타데이터 (Token Metadata)", () => {
    beforeEach(async () => {
      await factory.deployToken(TOKEN_NAME, TOKEN_SYMBOL, musician1.address);
    });

    it("배포된 토큰의 메타데이터를 조회할 수 있어야 함", async () => {
      const tokenAddress = await factory.getMusicianToken(musician1.address);
      const token = await ethers.getContractAt("MusicianToken", tokenAddress);

      const [name, symbol, decimals, totalSupply] =
        await token.getTokenMetadata();

      expect(name).to.equal(TOKEN_NAME);
      expect(symbol).to.equal(TOKEN_SYMBOL);
      expect(decimals).to.equal(18);
      expect(totalSupply).to.equal(ethers.parseEther("10000"));
    });

    it("배포된 토큰의 초기 할당이 정확해야 함", async () => {
      const tokenAddress = await factory.getMusicianToken(musician1.address);
      const token = await ethers.getContractAt("MusicianToken", tokenAddress);

      const musicianBalance = await token.balanceOf(musician1.address);
      const totalSupply = await token.totalSupply();
      const expectedAllocation = (totalSupply * 20n) / 100n;

      expect(musicianBalance).to.equal(expectedAllocation);
    });
  });

  describe("가스 효율성 (Gas Efficiency)", () => {
    it("토큰 배포의 가스 비용을 측정할 수 있어야 함", async () => {
      const tx = await factory.deployToken(
        TOKEN_NAME,
        TOKEN_SYMBOL,
        musician1.address
      );
      const receipt = await tx.wait();

      // 가스 사용량을 로깅 (테스트에서 확인용)
      console.log(`Token deployment gas used: ${receipt?.gasUsed}`);

      // 기대값: 가스 사용량이 200,000 이하 (Clones 효율성)
      expect(receipt?.gasUsed).to.be.lessThan(200000n);
    });
  });
});
