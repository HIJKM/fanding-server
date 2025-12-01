"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletValidator = void 0;
const ethers_1 = require("ethers");
/**
 * T026: Wallet Validation Utility
 * Validates Ethereum wallet addresses and formats
 */
class WalletValidator {
    /**
     * Check if string is a valid Ethereum address
     * @param address Address to validate
     * @returns true if valid Ethereum address
     */
    static isValidAddress(address) {
        try {
            return ethers_1.ethers.isAddress(address);
        }
        catch {
            return false;
        }
    }
    /**
     * Convert address to checksummed format
     * @param address Address to checksum
     * @returns Checksummed address
     */
    static getChecksumAddress(address) {
        try {
            return ethers_1.ethers.getAddress(address);
        }
        catch (error) {
            throw new Error(`Invalid address format: ${address}`);
        }
    }
    /**
     * Validate and normalize wallet address
     * @param address Address to validate and normalize
     * @returns Normalized checksummed address
     */
    static validateAndNormalize(address) {
        if (!address || typeof address !== 'string') {
            throw new Error('Address must be a non-empty string');
        }
        const trimmed = address.trim();
        if (!this.isValidAddress(trimmed)) {
            throw new Error(`Invalid Ethereum address: ${address}`);
        }
        return this.getChecksumAddress(trimmed);
    }
    /**
     * Validate multiple addresses
     * @param addresses Array of addresses to validate
     * @returns Array of normalized addresses
     */
    static validateMultiple(addresses) {
        if (!Array.isArray(addresses)) {
            throw new Error('Addresses must be an array');
        }
        return addresses.map((addr) => this.validateAndNormalize(addr));
    }
    /**
     * Check if two addresses are equal (case-insensitive)
     * @param address1 First address
     * @param address2 Second address
     * @returns true if addresses are equal
     */
    static areAddressesEqual(address1, address2) {
        try {
            const normalized1 = this.getChecksumAddress(address1);
            const normalized2 = this.getChecksumAddress(address2);
            return normalized1.toLowerCase() === normalized2.toLowerCase();
        }
        catch {
            return false;
        }
    }
    /**
     * Validate address format for API requests
     * @param address Address from API request
     * @returns Validation result with error message if invalid
     */
    static validateApiAddress(address) {
        try {
            if (!address) {
                return { valid: false, error: 'Address is required' };
            }
            if (typeof address !== 'string') {
                return { valid: false, error: 'Address must be a string' };
            }
            if (address.length === 0) {
                return { valid: false, error: 'Address cannot be empty' };
            }
            if (!this.isValidAddress(address)) {
                return { valid: false, error: 'Invalid Ethereum address format' };
            }
            const normalized = this.getChecksumAddress(address);
            return { valid: true, normalized };
        }
        catch (error) {
            return { valid: false, error: error.message };
        }
    }
}
exports.WalletValidator = WalletValidator;
//# sourceMappingURL=walletValidator.js.map