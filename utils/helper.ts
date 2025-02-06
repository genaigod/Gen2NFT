import "dotenv/config";

export const getProviderRpcUrl = (network: string) => {
  let rpcUrl;

  switch (network) {
    case "ethereum":
      rpcUrl = process.env.ETHEREUM_RPC_URL;
      break;
    case "polygon":
      rpcUrl = process.env.POLYGON_RPC_URL;
      break;
    case "optimism":
      rpcUrl = process.env.OPTIMISM_RPC_URL;
      break;
    case "arbitrum":
      rpcUrl = process.env.ARBITRUM_RPC_URL;
      break;
    case "avalanche":
      rpcUrl = process.env.AVALANCHE_RPC_URL;
      break;
    case "base":
      rpcUrl = process.env.BASE_RPC_URL;
      break;
    case "bsc":
      rpcUrl = process.env.BSC_PRC_URL;
      break;
    case "zksync":
      rpcUrl = process.env.ZKSYNC_RPC_URL;
      break;
    case "linea":
      rpcUrl = process.env.LINEA_RPC_URL;
      break;
    case "ape":
      rpcUrl = process.env.APE_RPC_URL;
      break;
    case "baseSepolia":
      rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
      break;
    default:
      throw new Error("Unknown network: " + network);
  }

  if (!rpcUrl)
    throw new Error(
      `rpcUrl empty for network ${network} - check your environment variables`
    );

  return rpcUrl;
};

export const getPrivateKey = () => {
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey)
    throw new Error(
      "private key not provided - check your environment variables"
    );

  return privateKey;
};
