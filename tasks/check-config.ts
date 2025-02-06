import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { Wallet, JsonRpcProvider } from "ethers";
import { getPrivateKey, getProviderRpcUrl } from "../utils/helper";
import { AgentProxyERC7007Collection__factory } from "../typechain-types";

task(`check-config`, "npx hardhat --network <network> check-config --app <app>")
  .addParam(`app`)
  .setAction(
    async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
      const { app } = taskArguments;
      const privateKey = getPrivateKey();
      const rpcProviderUrl = getProviderRpcUrl(hre.network.name);

      const provider = new JsonRpcProvider(rpcProviderUrl);
      const wallet = new Wallet(privateKey);
      const deployer = wallet.connect(provider);
      const contract = AgentProxyERC7007Collection__factory.connect(
        app,
        deployer
      );
      // total supply
      const supply = await contract.MAX_SUPPLY();
      // per wallet mint limit
      const perWalletMintLimit = await contract.PER_WALLET_MINT_LIMIT();
      // collection base uri
      const baseUri = await contract.COLLECTION_BASE_URI();

      console.log(`✅ total supply: ${supply}`);
      console.log(`✅ per wallet mint limit: ${perWalletMintLimit}`);
      console.log(`✅ collection base uri: ${baseUri}`);
    }
  );
