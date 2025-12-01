import { blockchainService } from './blockchainService';
import { SymbolGenerator } from '../utils/symbolGenerator';

/**
 * T032: Token Deployment Service
 * Orchestrates token deployment workflow
 */

interface DeploymentRequest {
  musicianName: string;
  musicianAddress: string;
  musicianWalletAddress: string;
}

interface DeploymentResult {
  tokenAddress: string;
  symbol: string;
  tokenName: string;
  deploymentTxHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  errorMessage?: string;
}

class TokenDeploymentService {
  /**
   * Generate token symbol from musician name
   */
  static generateSymbol(musicianName: string): string {
    try {
      return SymbolGenerator.generateSymbol(musicianName, true);
    } catch (error: any) {
      throw new Error(`Failed to generate token symbol: ${error.message}`);
    }
  }

  /**
   * Generate token symbol without random suffix
   */
  static generateBaseSymbol(musicianName: string): string {
    try {
      return SymbolGenerator.generateSymbol(musicianName, false);
    } catch (error: any) {
      throw new Error(`Failed to generate base symbol: ${error.message}`);
    }
  }

  /**
   * Deploy a new musician token
   */
  static async deployToken(request: DeploymentRequest): Promise<DeploymentResult> {
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
      const deploymentResult = await blockchainService.deployToken(
        tokenName,
        tokenSymbol,
        request.musicianAddress
      );

      return {
        tokenAddress: deploymentResult.tokenAddress,
        symbol: tokenSymbol,
        tokenName,
        deploymentTxHash: deploymentResult.txHash,
        status: 'confirmed',
      };
    } catch (error: any) {
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
  static async verifyTokenDeployment(tokenAddress: string): Promise<boolean> {
    try {
      return await blockchainService.isTokenDeployedByFactory(tokenAddress);
    } catch (error: any) {
      throw new Error(`Failed to verify token deployment: ${error.message}`);
    }
  }

  /**
   * Get deployed token count
   */
  static async getDeployedTokenCount(): Promise<number> {
    try {
      return await blockchainService.getDeployedTokenCount();
    } catch (error: any) {
      throw new Error(`Failed to get token count: ${error.message}`);
    }
  }

  /**
   * Check network connectivity
   */
  static async isNetworkAvailable(): Promise<boolean> {
    try {
      return await blockchainService.isNetworkConnected();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get factory address
   */
  static getFactoryAddress(): string {
    return blockchainService.getFactoryAddress();
  }

  /**
   * Get deployer address
   */
  static getDeployerAddress(): string | null {
    return blockchainService.getDeployerAddress();
  }
}

export { TokenDeploymentService, DeploymentRequest, DeploymentResult };
