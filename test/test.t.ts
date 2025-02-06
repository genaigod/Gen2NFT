import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("AgentProxyERC7007Collection", function () {
  let owner: any, agent: any, user: any, recipient: any, contract: any;
  let receiptHash = ethers.keccak256(ethers.toUtf8Bytes("receipt"));

  beforeEach(async function () {
    [owner, agent, user, recipient] = await ethers.getSigners();

    const AgentProxyERC7007Collection = await ethers.getContractFactory(
      "AgentProxyERC7007Collection"
    );
    contract = await upgrades.deployProxy(AgentProxyERC7007Collection, [
      "TestNFT", // name
      "TNFT", // symbol
      owner.address, // owner
      agent.address, // agent/minter
      100, // max supply
      5, // per wallet mint limit
      "https://baseuri.com/", // base uri
    ]);
    await contract.waitForDeployment();
  });

  it("should initialize with correct values", async function () {
    expect(await contract.owner()).to.equal(owner.address);
    expect(await contract.MAX_SUPPLY()).to.equal(100);
    expect(await contract.PER_WALLET_MINT_LIMIT()).to.equal(5);
    expect(await contract.COLLECTION_BASE_URI()).to.equal(
      "https://baseuri.com/"
    );
    expect(await contract.agents(agent.address)).to.be.true;
  });

  it("should allow an authorized agent to mint NFTs", async function () {
    await expect(
      contract
        .connect(agent)
        .mint(
          user.address,
          "https://token-uri.com/1",
          receiptHash,
          "0x1234",
          "0x5678",
          "0x9abc"
        )
    ).to.emit(contract, "AigcData");
    expect(await contract.totalSupply()).to.equal(1);
  });

  it("should not allow unauthorized users to mint", async function () {
    await expect(
      contract
        .connect(user)
        .mint(
          user.address,
          "https://token-uri.com/2",
          receiptHash,
          "0x1234",
          "0x5678",
          "0x9abc"
        )
    ).to.be.revertedWithCustomError(contract, "InvalidMinter");
  });

  it("should prevent duplicate receipts", async function () {
    await contract
      .connect(agent)
      .mint(
        user.address,
        "https://token-uri.com/1",
        receiptHash,
        "0x1234",
        "0x5678",
        "0x9abc"
      );
    await expect(
      contract
        .connect(agent)
        .mint(
          user.address,
          "https://token-uri.com/2",
          receiptHash,
          "0x1234",
          "0x5678",
          "0x9abc"
        )
    ).to.be.revertedWithCustomError(contract, "ReceiptAlreadyUsed");
  });

  it("should allow owner to update agents", async function () {
    await contract.connect(owner).updateAgent(user.address, true);
    expect(await contract.agents(user.address)).to.be.true;
  });

  it("should allow owner to pause and unpause contract", async function () {
    await contract.connect(owner).pause();
    await expect(
      contract
        .connect(agent)
        .mint(
          user.address,
          "https://token-uri.com/1",
          receiptHash,
          "0x1234",
          "0x5678",
          "0x9abc"
        )
    ).to.be.revertedWithCustomError(contract, "EnforcedPause");
    await contract.connect(owner).unpause();
    await contract
      .connect(agent)
      .mint(
        user.address,
        "https://token-uri.com/1",
        receiptHash,
        "0x1234",
        "0x5678",
        "0x9abc"
      );
    expect(await contract.totalSupply()).to.equal(1);
  });
});
