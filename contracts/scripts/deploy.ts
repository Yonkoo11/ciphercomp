import { ethers } from "hardhat";

// BLS OEWS-inspired boundaries (USD annual salary)
// Top 5 roles x 3 locations for hackathon demo
const ROLE_CONFIGS = [
  {
    role: "Software Engineer",
    locations: [
      { name: "San Francisco", boundaries: [65000, 85000, 105000, 130000, 160000, 195000, 240000, 320000] },
      { name: "New York", boundaries: [60000, 80000, 100000, 125000, 155000, 190000, 235000, 310000] },
      { name: "Austin", boundaries: [55000, 72000, 90000, 112000, 140000, 172000, 215000, 285000] },
    ],
  },
  {
    role: "Data Scientist",
    locations: [
      { name: "San Francisco", boundaries: [70000, 90000, 112000, 138000, 168000, 205000, 250000, 330000] },
      { name: "New York", boundaries: [65000, 85000, 105000, 130000, 160000, 195000, 240000, 315000] },
      { name: "Austin", boundaries: [58000, 75000, 95000, 118000, 145000, 178000, 220000, 290000] },
    ],
  },
  {
    role: "Product Manager",
    locations: [
      { name: "San Francisco", boundaries: [72000, 92000, 115000, 142000, 175000, 212000, 258000, 340000] },
      { name: "New York", boundaries: [68000, 88000, 110000, 135000, 168000, 205000, 250000, 325000] },
      { name: "Austin", boundaries: [60000, 78000, 98000, 122000, 152000, 185000, 228000, 300000] },
    ],
  },
  {
    role: "DevOps Engineer",
    locations: [
      { name: "San Francisco", boundaries: [62000, 82000, 102000, 128000, 158000, 192000, 238000, 315000] },
      { name: "New York", boundaries: [58000, 78000, 98000, 122000, 152000, 185000, 230000, 305000] },
      { name: "Austin", boundaries: [52000, 70000, 88000, 110000, 138000, 170000, 212000, 280000] },
    ],
  },
  {
    role: "UX Designer",
    locations: [
      { name: "San Francisco", boundaries: [58000, 75000, 95000, 118000, 148000, 182000, 225000, 298000] },
      { name: "New York", boundaries: [55000, 72000, 90000, 115000, 142000, 175000, 218000, 288000] },
      { name: "Austin", boundaries: [48000, 65000, 82000, 105000, 132000, 162000, 202000, 268000] },
    ],
  },
];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Deploy SalaryBenchmark
  console.log("\n--- Deploying SalaryBenchmark ---");
  const SalaryBenchmark = await ethers.getContractFactory("SalaryBenchmark");
  const benchmark = await SalaryBenchmark.deploy();
  await benchmark.waitForDeployment();
  const address = await benchmark.getAddress();
  console.log("SalaryBenchmark:", address);

  // Configure roles with BLS boundaries
  console.log("\n--- Configuring roles ---");
  let configured = 0;
  for (const roleConfig of ROLE_CONFIGS) {
    for (const loc of roleConfig.locations) {
      const tx = await benchmark.configureRole(
        roleConfig.role,
        loc.name,
        loc.boundaries as [number, number, number, number, number, number, number, number]
      );
      await tx.wait();
      configured++;
      console.log(`  [${configured}/15] ${roleConfig.role} / ${loc.name}`);
    }
  }

  // Print env vars for frontend
  console.log("\n--- Frontend .env ---");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log(`NEXT_PUBLIC_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc`);
  console.log(`NEXT_PUBLIC_CHAIN_ID=421614`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
