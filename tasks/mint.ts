import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { Wallet, JsonRpcProvider } from "ethers";
import { getPrivateKey, getProviderRpcUrl } from "../utils/helper";
import { AgentProxyERC7007Collection__factory } from "../typechain-types";

task(
  `mint`,
  "npx hardhat mint --network <network> --app <app> --to <to> --url <url> --receipt <receipt> --prompt <prompt> --aigc-data <aigcData> --proof <proof>"
)
  .addParam(`app`)
  .addParam(`to`)
  .addParam(`url`)
  .addParam(`receipt`)
  .addParam(`prompt`)
  .addParam(`aigcData`)
  .addParam(`proof`)
  .setAction(
    async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
      const { app, to, url, receipt, prompt, aigcData, proof } = taskArguments;
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
      const tx = await contract.mint(
        to,
        url,
        receipt,
        prompt,
        aigcData,
        proof,
        { gasPrice }
      );
      await tx.wait();
      console.log(`✅ Transaction hash:`, tx.hash);
    }
  );
