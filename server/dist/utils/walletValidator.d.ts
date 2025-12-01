/**
 * T026: Wallet Validation Utility
 * Validates Ethereum wallet addresses and formats
 */
declare class WalletValidator {
    /**
     * Check if string is a valid Ethereum address
     * @param address Address to validate
     * @returns true if valid Ethereum address
     */
    static isValidAddress(address: string): boolean;
    /**
     * Convert address to checksummed format
     * @param address Address to checksum
     * @returns Checksummed address
     */
    static getChecksumAddress(address: string): string;
    /**
     * Validate and normalize wallet address
     * @param address Address to validate and normalize
     * @returns Normalized checksummed address
     */
    static validateAndNormalize(address: string): string;
    /**
     * Validate multiple addresses
     * @param addresses Array of addresses to validate
     * @returns Array of normalized addresses
     */
    static validateMultiple(addresses: string[]): string[];
    /**
     * Check if two addresses are equal (case-insensitive)
     * @param address1 First address
     * @param address2 Second address
     * @returns true if addresses are equal
     */
    static areAddressesEqual(address1: string, address2: string): boolean;
    /**
     * Validate address format for API requests
     * @param address Address from API request
     * @returns Validation result with error message if invalid
     */
    static validateApiAddress(address: string): {
        valid: boolean;
        error?: string;
        normalized?: string;
    };
}
export { WalletValidator };
//# sourceMappingURL=walletValidator.d.ts.map