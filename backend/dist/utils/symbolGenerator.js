"use strict";
/**
 * T028: Symbol Generation Service
 * Generates token symbols from musician names
 *
 * Strategy: Romanize Korean name → Extract initials → Add random suffix for collision handling
 * Example: "민수" → "MS" → "MS87"
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolGenerator = void 0;
class SymbolGenerator {
    /**
     * Check if character is Korean Hangul
     * @param char Character to check
     * @returns true if Korean Hangul character
     */
    static isKorean(char) {
        const code = char.charCodeAt(0);
        return (code >= 0xac00 && code <= 0xd7a3) || // Hangul syllables
            (code >= 0x1100 && code <= 0x11ff) || // Hangul Jamo
            (code >= 0x3130 && code <= 0x318f); // Hangul Compatibility Jamo
    }
    /**
     * Decompose Korean syllable to individual jamo (consonants/vowels)
     * @param char Korean character to decompose
     * @returns Array of jamo characters
     */
    static decomposeKorean(char) {
        const code = char.charCodeAt(0);
        // Check if character is a Hangul syllable
        if (code >= 0xac00 && code <= 0xd7a3) {
            const syllableCode = code - 0xac00;
            const final = syllableCode % 28;
            const medial = Math.floor((syllableCode / 28) % 21);
            const initial = Math.floor(syllableCode / (21 * 28));
            // Jamo arrays
            const initials = [
                'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅄ',
                'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
            ];
            const medials = [
                'ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ',
                'ㅐ', 'ㅒ', 'ㅔ', 'ㅘ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅙ', 'ㅟ', 'ㅢ',
                'ㅦ', 'ㅧ', 'ㅨ', 'ㅩ',
            ];
            const finals = [
                '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ',
                'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ',
                'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ',
            ];
            const result = [
                initials[initial],
                medials[medial],
            ];
            if (final > 0) {
                result.push(finals[final]);
            }
            return result;
        }
        return [char];
    }
    /**
     * Romanize Korean text
     * @param koreanText Text to romanize
     * @returns Romanized text
     */
    static romanize(koreanText) {
        let result = '';
        for (const char of koreanText) {
            if (this.isKorean(char)) {
                const jamos = this.decomposeKorean(char);
                for (const jamo of jamos) {
                    result += this.KOREAN_TO_LATIN[jamo] || jamo;
                }
            }
            else if (/[a-zA-Z0-9]/.test(char)) {
                result += char.toUpperCase();
            }
        }
        return result;
    }
    /**
     * Extract initials from romanized text
     * @param romanized Romanized text
     * @returns Initials (up to 4 characters for safety)
     */
    static extractInitials(romanized) {
        const consonants = romanized.replace(/[AEIOUEO]/g, '');
        return consonants.substring(0, 4).toUpperCase();
    }
    /**
     * Generate random 2-digit suffix
     * @returns Random 2-digit number as string (00-99)
     */
    static generateRandomSuffix() {
        const random = Math.floor(Math.random() * 100);
        return String(random).padStart(2, '0');
    }
    /**
     * Generate token symbol from musician name
     * @param musicianName Name of the musician (can be Korean or English)
     * @param ensureUniqueness If true, adds random suffix for collision handling
     * @returns Generated token symbol (2-4 characters)
     */
    static generateSymbol(musicianName, ensureUniqueness = true) {
        if (!musicianName || musicianName.trim().length === 0) {
            throw new Error('Musician name cannot be empty');
        }
        const trimmed = musicianName.trim();
        // Romanize if Korean
        const romanized = this.romanize(trimmed);
        if (romanized.length === 0) {
            throw new Error('Cannot generate symbol from provided name');
        }
        // Extract initials
        let symbol = this.extractInitials(romanized);
        // If no initials (only vowels), use first letters of romanized text
        if (symbol.length === 0) {
            symbol = romanized.substring(0, 2).toUpperCase();
        }
        // Ensure minimum length
        if (symbol.length === 0) {
            symbol = 'X';
        }
        // Add random suffix if requested
        if (ensureUniqueness) {
            const suffix = this.generateRandomSuffix();
            symbol = symbol + suffix;
        }
        return symbol;
    }
    /**
     * Generate multiple symbol candidates for a musician name
     * @param musicianName Musician name
     * @param count Number of candidates to generate
     * @returns Array of symbol candidates
     */
    static generateSymbolCandidates(musicianName, count = 3) {
        const candidates = new Set();
        const baseSymbol = this.generateSymbol(musicianName, false);
        // Add base symbol
        candidates.add(baseSymbol);
        // Generate variants with different suffixes
        while (candidates.size < count) {
            const variant = this.generateSymbol(musicianName, true);
            candidates.add(variant);
        }
        return Array.from(candidates).slice(0, count);
    }
}
exports.SymbolGenerator = SymbolGenerator;
/**
 * Korean to Latin romanization mapping
 * Covers common Korean consonants and vowels
 */
SymbolGenerator.KOREAN_TO_LATIN = {
    // Consonants (자음)
    ㄱ: 'G',
    ㄲ: 'GG',
    ㄴ: 'N',
    ㄷ: 'D',
    ㄸ: 'DD',
    ㄹ: 'R',
    ㅁ: 'M',
    ㅂ: 'B',
    ㅃ: 'BB',
    ㅄ: 'BS',
    ㅅ: 'S',
    ㅆ: 'SS',
    ㅇ: '',
    ㅈ: 'J',
    ㅉ: 'JJ',
    ㅊ: 'CH',
    ㅋ: 'K',
    ㅌ: 'T',
    ㅍ: 'P',
    ㅎ: 'H',
    // Vowels (모음)
    ㅏ: 'A',
    ㅑ: 'A',
    ㅓ: 'E',
    ㅕ: 'EO',
    ㅗ: 'O',
    ㅛ: 'O',
    ㅜ: 'U',
    ㅠ: 'U',
    ㅡ: 'EU',
    ㅣ: 'I',
    ㅐ: 'AE',
    ㅒ: 'OE',
    ㅔ: 'E',
    ㅘ: 'WA',
    ㅚ: 'WA',
    ㅝ: 'WEO',
    ㅞ: 'WE',
    ㅙ: 'WAE',
    ㅟ: 'WI',
    ㅢ: 'EUI',
    ㅦ: 'EO',
    ㅧ: 'E',
    ㅨ: 'U',
    ㅩ: 'I',
};
//# sourceMappingURL=symbolGenerator.js.map