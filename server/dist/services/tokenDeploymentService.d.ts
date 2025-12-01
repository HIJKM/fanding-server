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
declare class TokenDeploymentService {
    /**
     * Generate token symbol from musician name
     */
    static generateSymbol(musicianName: string): string;
    /**
     * Generate token symbol without random suffix
     */
    static generateBaseSymbol(musicianName: string): string;
    /**
     * Deploy a new musician token
     */
    static deployToken(request: DeploymentRequest): Promise<DeploymentResult>;
    /**
     * Check if token was deployed by the factory
     */
    static verifyTokenDeployment(tokenAddress: string): Promise<boolean>;
    /**
     * Get deployed token count
     */
    static getDeployedTokenCount(): Promise<number>;
    /**
     * Check network connectivity
     */
    static isNetworkAvailable(): Promise<boolean>;
    /**
     * Get factory address
     */
    static getFactoryAddress(): string;
    /**
     * Get deployer address
     */
    static getDeployerAddress(): string | null;
}
export { TokenDeploymentService, DeploymentRequest, DeploymentResult };
//# sourceMappingURL=tokenDeploymentService.d.ts.map