import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { Wallet, JsonRpcProvider } from "ethers";
import { getPrivateKey, getProviderRpcUrl } from "../utils/helper";
import { AgentProxyERC7007Collection__factory } from "../typechain-types";

task(
  `set-wallet-limit`,
  "npx hardhat set-wallet-limit --network <network> --app <app> --limit <limit>"
)
  .addParam(`app`)
  .addParam(`limit`)
  .setAction(
    async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
      const { app, limit } = taskArguments;
      const privateKey = getPrivateKey();
      const rpcProviderUrl = getProviderRpcUrl(hre.network.name);

      const provider = new JsonRpcProvider(rpcProviderUrl);
      const wallet = new Wallet(privateKey);
      const deployer = wallet.connect(provider);
      const gasPrice = (await provider.getFeeData()).gasPrice;
      const contract = AgentProxyERC7007Collection__factory.connect(
        app,
        deployer
      );

      const tx = await contract.updatePerWalletMintLimit(limit, { gasPrice });
      await tx.wait();
      console.log(`✅ Transaction hash:`, tx.hash);
    }
  );
