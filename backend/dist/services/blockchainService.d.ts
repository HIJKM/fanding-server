declare class BlockchainService {
    private provider;
    private factoryAddress;
    private factoryContract;
    private deployerWallet?;
    constructor();
    /**
     * Deploy a new musician token
     * @param musicianName Token name (e.g., "민수 Token")
     * @param musicianSymbol Token symbol (e.g., "MS87")
     * @param musicianAddress Musician's wallet address
     * @returns Deployed token address and transaction hash
     */
    deployToken(musicianName: string, musicianSymbol: string, musicianAddress: string): Promise<{
        tokenAddress: string;
        txHash: string;
    }>;
    /**
     * Get musician's token address
     * @param musicianAddress Musician's wallet address
     * @returns Token address or null if not deployed
     */
    getMusicianToken(musicianAddress: string): Promise<string | null>;
    /**
     * Check if token was deployed by this factory
     * @param tokenAddress Token contract address
     * @returns true if deployed by factory, false otherwise
     */
    isTokenDeployedByFactory(tokenAddress: string): Promise<boolean>;
    /**
     * Get deployed token count
     * @returns Number of deployed tokens
     */
    getDeployedTokenCount(): Promise<number>;
    /**
     * Get deployer wallet address
     * @returns Wallet address if available
     */
    getDeployerAddress(): string | null;
    /**
     * Get factory address
     * @returns Factory contract address
     */
    getFactoryAddress(): string;
    /**
     * T046: Buy musician token
     * @param tokenAddress Musician token contract address
     * @param amount Number of tokens to purchase
     * @returns Transaction hash
     */
    buyToken(tokenAddress: string, amount: number): Promise<string>;
    /**
     * Check network connection
     * @returns true if connected to network
     */
    isNetworkConnected(): Promise<boolean>;
}
export declare function getBlockchainService(): BlockchainService;
export declare const blockchainService: any;
export type { BlockchainService };
//# sourceMappingURL=blockchainService.d.ts.map