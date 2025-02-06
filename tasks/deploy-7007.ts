import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { Wallet, JsonRpcProvider } from "ethers";
import { getPrivateKey, getProviderRpcUrl } from "../utils/helper";
import { AgentProxyERC7007Collection__factory } from "../typechain-types";

task(
  `deploy-7007`,
  "npx hardhat deploy-7007 --network <network> --name <name> --symbol <symbol> --owner <owner> --minter <minter> --max-supply <maxSupply> --mint-limit <perWalletMintLimit> --base-url <baseUrl>"
)
  .addParam("name", "token name")
  .addParam("symbol", "token symbol")
  .addParam("owner", "owner address")
  .addParam("minter", "minter/agent address")
  .addOptionalParam("maxSupply", "total supply")
  .addOptionalParam("mintLimit", "per wallet mint limit")
  .addOptionalParam("baseUrl", "collection base url")
  .setAction(
    async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
      const { name, symbol, owner, minter, maxSupply, mintLimit, baseUrl } =
        taskArguments;
      const privateKey = getPrivateKey();
      const rpcProviderUrl = getProviderRpcUrl(hre.network.name);

      const provider = new JsonRpcProvider(rpcProviderUrl);
      const wallet = new Wallet(privateKey);
      const deployer = wallet.connect(provider);

      const factory: AgentProxyERC7007Collection__factory =
        (await hre.ethers.getContractFactory(
          "AgentProxyERC7007Collection"
        )) as AgentProxyERC7007Collection__factory;

      const contract = await hre.upgrades.deployProxy(factory, [
        name,
        symbol,
        owner,
        minter,
        maxSupply || 0,
        mintLimit || 0,
        baseUrl || "",
      ]);
      await contract.waitForDeployment();
      const address = await contract.getAddress();

      console.log(
        `✅ Contract deployed at address ${address} on the ${hre.network.name} blockchain`
      );
    }
  );
