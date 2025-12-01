"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockchainService = void 0;
exports.getBlockchainService = getBlockchainService;
const ethers_1 = require("ethers");
/**
 * T027: Blockchain Service
 * Handles all blockchain interactions using ethers.js
 * Manages contract deployments and token operations
 */
// Contract artifacts (will be imported from compiled contracts)
const MusicianTokenFactoryABI = require('../../../contracts/artifacts/contracts/MusicianTokenFactory.sol/MusicianTokenFactory.json').abi;
class BlockchainService {
    constructor() {
        try {
            console.log('🔧 Initializing BlockchainService...');
            // Initialize provider (Ethereum Sepolia)
            const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/';
            console.log(`   RPC URL: ${rpcUrl.substring(0, 50)}...`);
            this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
            console.log('   ✅ Provider initialized');
            // Get factory address
            this.factoryAddress = process.env.MUSICIAN_TOKEN_FACTORY_ADDRESS || '';
            console.log(`   Factory Address: ${this.factoryAddress}`);
            if (!this.factoryAddress) {
                throw new Error('MUSICIAN_TOKEN_FACTORY_ADDRESS not configured');
            }
            console.log('   ✅ Factory address set');
            // Initialize factory contract
            this.factoryContract = new ethers_1.ethers.Contract(this.factoryAddress, MusicianTokenFactoryABI, this.provider);
            console.log('   ✅ Factory contract initialized');
            // Setup deployer wallet if private key is available
            const privateKey = process.env.SERVICE_WALLET_PRIVATE_KEY;
            if (privateKey) {
                this.deployerWallet = new ethers_1.ethers.Wallet(privateKey, this.provider);
                // Connect to signer for transactions
                this.factoryContract = this.factoryContract.connect(this.deployerWallet);
                console.log('   ✅ Deployer wallet configured');
            }
            console.log('✅ BlockchainService initialized successfully');
        }
        catch (error) {
            console.error('❌ BlockchainService initialization failed:', error.message);
            throw error;
        }
    }
    /**
     * Deploy a new musician token
     * @param musicianName Token name (e.g., "민수 Token")
     * @param musicianSymbol Token symbol (e.g., "MS87")
     * @param musicianAddress Musician's wallet address
     * @returns Deployed token address and transaction hash
     */
    async deployToken(musicianName, musicianSymbol, musicianAddress) {
        try {
            // Validate inputs
            if (!ethers_1.ethers.isAddress(musicianAddress)) {
                throw new Error('Invalid musician address');
            }
            // Call factory to deploy token
            const tx = await this.factoryContract.deployToken(musicianName, musicianSymbol, musicianAddress);
            // Wait for transaction confirmation
            const receipt = await tx.wait();
            if (!receipt) {
                throw new Error('Transaction failed to confirm');
            }
            // Get token address from events
            const event = receipt.logs
                ?.map((log) => {
                try {
                    return this.factoryContract.interface.parseLog(log);
                }
                catch {
                    return null;
                }
            })
                .find((evt) => evt?.name === 'TokenDeployed');
            if (!event) {
                throw new Error('TokenDeployed event not found');
            }
            const tokenAddress = event.args[1]; // tokenAddress is at index 1
            return {
                tokenAddress,
                txHash: tx.hash,
            };
        }
        catch (error) {
            throw new Error(`Token deployment failed: ${error.message}`);
        }
    }
    /**
     * Get musician's token address
     * @param musicianAddress Musician's wallet address
     * @returns Token address or null if not deployed
     */
    async getMusicianToken(musicianAddress) {
        try {
            if (!ethers_1.ethers.isAddress(musicianAddress)) {
                throw new Error('Invalid musician address');
            }
            const tokenAddress = await this.factoryContract.getMusicianToken(musicianAddress);
            // Return null if zero address
            if (tokenAddress === ethers_1.ethers.ZeroAddress) {
                return null;
            }
            return tokenAddress;
        }
        catch (error) {
            throw new Error(`Failed to get musician token: ${error.message}`);
        }
    }
    /**
     * Check if token was deployed by this factory
     * @param tokenAddress Token contract address
     * @returns true if deployed by factory, false otherwise
     */
    async isTokenDeployedByFactory(tokenAddress) {
        try {
            if (!ethers_1.ethers.isAddress(tokenAddress)) {
                throw new Error('Invalid token address');
            }
            return await this.factoryContract.isTokenDeployedByFactory(tokenAddress);
        }
        catch (error) {
            throw new Error(`Failed to verify token deployment: ${error.message}`);
        }
    }
    /**
     * Get deployed token count
     * @returns Number of deployed tokens
     */
    async getDeployedTokenCount() {
        try {
            const count = await this.factoryContract.getDeployedTokenCount();
            return count.toNumber ? count.toNumber() : Number(count);
        }
        catch (error) {
            throw new Error(`Failed to get token count: ${error.message}`);
        }
    }
    /**
     * Get deployer wallet address
     * @returns Wallet address if available
     */
    getDeployerAddress() {
        return this.deployerWallet?.address || null;
    }
    /**
     * Get factory address
     * @returns Factory contract address
     */
    getFactoryAddress() {
        return this.factoryAddress;
    }
    /**
     * T046: Buy musician token
     * @param tokenAddress Musician token contract address
     * @param amount Number of tokens to purchase
     * @returns Transaction hash
     */
    async buyToken(tokenAddress, amount) {
        try {
            // Validate inputs
            if (!ethers_1.ethers.isAddress(tokenAddress)) {
                throw new Error('Invalid token address');
            }
            if (amount <= 0) {
                throw new Error('Amount must be greater than 0');
            }
            // Import token ABI (assuming ERC20 with buyToken function)
            const tokenABI = [
                'function buyToken(uint256 amount) public payable returns (bool)',
                'function getPrice() public view returns (uint256)',
            ];
            const tokenContract = new ethers_1.ethers.Contract(tokenAddress, tokenABI, this.deployerWallet);
            // Get token price
            const price = await tokenContract.getPrice();
            const totalCost = price * BigInt(amount);
            // Call buyToken function with payment
            const tx = await tokenContract.buyToken(amount, {
                value: totalCost,
            });
            // Wait for transaction confirmation
            const receipt = await tx.wait();
            if (!receipt) {
                throw new Error('Transaction failed to confirm');
            }
            return tx.hash;
        }
        catch (error) {
            throw new Error(`Token purchase failed: ${error.message}`);
        }
    }
    /**
     * Check network connection
     * @returns true if connected to network
     */
    async isNetworkConnected() {
        try {
            console.log('🔍 Checking network connection...');
            console.log(`   RPC URL: ${process.env.SEPOLIA_RPC_URL || 'FALLBACK'}`);
            const network = await this.provider.getNetwork();
            const chainId = typeof network.chainId === 'bigint' ? Number(network.chainId) : network.chainId;
            console.log(`   Network Chain ID: ${chainId}`);
            console.log(`   Expected Chain ID: 11155111`);
            console.log(`   Match: ${chainId === 11155111}`);
            return chainId === 11155111; // Ethereum Sepolia chain ID
        }
        catch (error) {
            console.error('❌ Network connection check failed:', error.message);
            return false;
        }
    }
}
// Lazy-loaded singleton instance
let instance = null;
function getBlockchainService() {
    if (!instance) {
        instance = new BlockchainService();
    }
    return instance;
}
// For backwards compatibility, export as a getter property
exports.blockchainService = new Proxy({}, {
    get: (_target, prop) => {
        return getBlockchainService()[prop];
    },
});
//# sourceMappingURL=blockchainService.js.map