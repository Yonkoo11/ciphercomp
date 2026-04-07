import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-ethers'
import 'cofhe-hardhat-plugin'
import * as dotenv from 'dotenv'

dotenv.config()

const config: HardhatUserConfig = {
	solidity: {
		version: '0.8.25',
		settings: {
			evmVersion: 'cancun',
		},
	},
	defaultNetwork: 'hardhat',
	networks: {
		'arb-sepolia': {
			url: process.env.ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
			accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
			chainId: 421614,
			gasMultiplier: 1.2,
			timeout: 60000,
		},
		'base-sepolia': {
			url: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
			accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
			chainId: 84532,
			gasMultiplier: 1.2,
			timeout: 60000,
		},
	},
	etherscan: {
		apiKey: {
			'arb-sepolia': process.env.ARBISCAN_API_KEY || '',
		},
	},
	sourcify: {
		enabled: true,
	},
}

export default config
