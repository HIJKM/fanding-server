"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenDeploymentService = void 0;
const blockchainService_1 = require("./blockchainService");
const symbolGenerator_1 = require("../utils/symbolGenerator");
class TokenDeploymentService {
    /**
     * Generate token symbol from musician name
     */
    static generateSymbol(musicianName) {
        try {
            return symbolGenerator_1.SymbolGenerator.generateSymbol(musicianName, true);
        }
        catch (error) {
            throw new Error(`Failed to generate token symbol: ${error.message}`);
        }
    }
    /**
     * Generate token symbol without random suffix
     */
    static generateBaseSymbol(musicianName) {
        try {
            return symbolGenerator_1.SymbolGenerator.generateSymbol(musicianName, false);
        }
        catch (error) {
            throw new Error(`Failed to generate base symbol: ${error.message}`);
        }
    }
    /**
     * Deploy a new musician token
     */
    static async deployToken(request) {
        try {
            // Validate input
            if (!request.musicianName || request.musicianName.trim().length === 0) {
                throw new Error('Musician name is required');
            }
            // Generate token name and symbol
            const tokenName = `${request.musicianName} Token`;
            const tokenSymbol = this.generateSymbol(request.musicianName);
            console.log(`📦 Deploying token: ${tokenName} (${tokenSymbol})`);
            console.log(`   Musician address: ${request.musicianAddress}`);
            console.log(`   Wallet address: ${request.musicianWalletAddress}`);
            // Call blockchain service to deploy token
            const deploymentResult = await blockchainService_1.blockchainService.deployToken(tokenName, tokenSymbol, request.musicianAddress);
            return {
                tokenAddress: deploymentResult.tokenAddress,
                symbol: tokenSymbol,
                tokenName,
                deploymentTxHash: deploymentResult.txHash,
                status: 'confirmed',
            };
        }
        catch (error) {
            console.error('❌ Token deployment failed:', error.message);
            return {
                tokenAddress: '',
                symbol: '',
                tokenName: `${request.musicianName} Token`,
                deploymentTxHash: '',
                status: 'failed',
                errorMessage: error.message,
            };
        }
    }
    /**
     * Check if token was deployed by the factory
     */
    static async verifyTokenDeployment(tokenAddress) {
        try {
            return await blockchainService_1.blockchainService.isTokenDeployedByFactory(tokenAddress);
        }
        catch (error) {
            throw new Error(`Failed to verify token deployment: ${error.message}`);
        }
    }
    /**
     * Get deployed token count
     */
    static async getDeployedTokenCount() {
        try {
            return await blockchainService_1.blockchainService.getDeployedTokenCount();
        }
        catch (error) {
            throw new Error(`Failed to get token count: ${error.message}`);
        }
    }
    /**
     * Check network connectivity
     */
    static async isNetworkAvailable() {
        try {
            return await blockchainService_1.blockchainService.isNetworkConnected();
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Get factory address
     */
    static getFactoryAddress() {
        return blockchainService_1.blockchainService.getFactoryAddress();
    }
    /**
     * Get deployer address
     */
    static getDeployerAddress() {
        return blockchainService_1.blockchainService.getDeployerAddress();
    }
}
exports.TokenDeploymentService = TokenDeploymentService;
//# sourceMappingURL=tokenDeploymentService.js.map