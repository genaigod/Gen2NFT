import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { Wallet, JsonRpcProvider } from "ethers";
import { getPrivateKey, getProviderRpcUrl } from "../utils/helper";
import { AgentProxyERC7007Collection__factory } from "../typechain-types";

task(`check-url`, "npx hardhat check-url --network <network> --app <app> --token <token>")
  .addParam(`app`)
  .addParam(`token`)
  .setAction(
    async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
      const { app, token } = taskArguments;
      const privateKey = getPrivateKey();
      const rpcProviderUrl = getProviderRpcUrl(hre.network.name);

      const provider = new JsonRpcProvider(rpcProviderUrl);
      const wallet = new Wallet(privateKey);
      const deployer = wallet.connect(provider);
      const contract = AgentProxyERC7007Collection__factory.connect(
        app,
        deployer
      );
      const url = await contract.tokenURI(token);

      console.log(`✅ token ${token} uri: ${url}`);
    }
  );
