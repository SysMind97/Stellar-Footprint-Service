import * as StellarSdk from "@stellar/stellar-sdk";

export type Network = "mainnet" | "testnet";

interface NetworkConfig {
  rpcUrl: string;
  networkPassphrase: string;
  secretKey: string;
}

function createNetworkConfig(): Record<Network, NetworkConfig> {
  return {
    mainnet: {
      rpcUrl: process.env.MAINNET_RPC_URL || "",
      networkPassphrase: StellarSdk.Networks.PUBLIC,
      secretKey: process.env.MAINNET_SECRET_KEY || "",
    },
    testnet: {
      rpcUrl:
        process.env.TESTNET_RPC_URL || "https://soroban-testnet.stellar.org",
      networkPassphrase: StellarSdk.Networks.TESTNET,
      secretKey: process.env.TESTNET_SECRET_KEY || "",
    },
  };
}

export function getNetworkConfig(network: Network = "testnet"): NetworkConfig {
  const config = createNetworkConfig()[network];
  if (!config.rpcUrl) {
    throw new Error(`RPC URL not configured for network: ${network}`);
  }
  return config;
}

export function getRpcServer(
  network: Network = "testnet",
): StellarSdk.SorobanRpc.Server {
  const { rpcUrl } = getNetworkConfig(network);
  return new StellarSdk.SorobanRpc.Server(rpcUrl, { allowHttp: false });
}
