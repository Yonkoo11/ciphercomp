import { defineChain } from "viem";
import SalaryBenchmarkABI from "./SalaryBenchmarkABI.json";

export const arbSepolia = defineChain({
  id: 421614,
  name: "Arbitrum Sepolia",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_RPC_URL ||
          "https://sepolia-rollup.arbitrum.io/rpc",
      ],
    },
  },
  blockExplorers: {
    default: { name: "Arbiscan", url: "https://sepolia.arbiscan.io" },
  },
  testnet: true,
});

// Deployed contract address (update after deployment)
export const SALARY_BENCHMARK_ADDRESS = (process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const SALARY_BENCHMARK_ABI = SalaryBenchmarkABI as readonly Record<
  string,
  unknown
>[];

export const NUM_BUCKETS = 8;
export const MIN_SAMPLE = 5;
