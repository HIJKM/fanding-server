/**
 * T028: Symbol Generation Service
 * Generates token symbols from musician names
 *
 * Strategy: Romanize Korean name → Extract initials → Add random suffix for collision handling
 * Example: "민수" → "MS" → "MS87"
 */
declare class SymbolGenerator {
    /**
     * Korean to Latin romanization mapping
     * Covers common Korean consonants and vowels
     */
    private static readonly KOREAN_TO_LATIN;
    /**
     * Check if character is Korean Hangul
     * @param char Character to check
     * @returns true if Korean Hangul character
     */
    private static isKorean;
    /**
     * Decompose Korean syllable to individual jamo (consonants/vowels)
     * @param char Korean character to decompose
     * @returns Array of jamo characters
     */
    private static decomposeKorean;
    /**
     * Romanize Korean text
     * @param koreanText Text to romanize
     * @returns Romanized text
     */
    private static romanize;
    /**
     * Extract initials from romanized text
     * @param romanized Romanized text
     * @returns Initials (up to 4 characters for safety)
     */
    private static extractInitials;
    /**
     * Generate random 2-digit suffix
     * @returns Random 2-digit number as string (00-99)
     */
    private static generateRandomSuffix;
    /**
     * Generate token symbol from musician name
     * @param musicianName Name of the musician (can be Korean or English)
     * @param ensureUniqueness If true, adds random suffix for collision handling
     * @returns Generated token symbol (2-4 characters)
     */
    static generateSymbol(musicianName: string, ensureUniqueness?: boolean): string;
    /**
     * Generate multiple symbol candidates for a musician name
     * @param musicianName Musician name
     * @param count Number of candidates to generate
     * @returns Array of symbol candidates
     */
    static generateSymbolCandidates(musicianName: string, count?: number): string[];
}
export { SymbolGenerator };
//# sourceMappingURL=symbolGenerator.d.ts.map