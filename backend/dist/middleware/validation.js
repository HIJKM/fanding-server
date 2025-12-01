"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAddressMiddleware = validateAddressMiddleware;
exports.validateMusicianNameMiddleware = validateMusicianNameMiddleware;
exports.validateAndGenerateSymbolMiddleware = validateAndGenerateSymbolMiddleware;
exports.validateNonEmptyBodyMiddleware = validateNonEmptyBodyMiddleware;
exports.validateQueryParamsMiddleware = validateQueryParamsMiddleware;
exports.sanitizeRequestMiddleware = sanitizeRequestMiddleware;
const walletValidator_1 = require("../utils/walletValidator");
const symbolGenerator_1 = require("../utils/symbolGenerator");
/**
 * T030: Request Validation Middleware
 * Validates common request parameters and data formats
 */
/**
 * Middleware: Validate Ethereum address in request body
 * Field name: address or musicianAddress
 */
function validateAddressMiddleware() {
    return (req, res, next) => {
        const address = req.body.address || req.body.musicianAddress || req.params.address;
        if (!address) {
            return next(); // Continue if no address to validate
        }
        const validation = walletValidator_1.WalletValidator.validateApiAddress(address);
        if (!validation.valid) {
            return res.status(400).json({
                type: 'https://fanding.dev/problems/400',
                title: 'Bad Request',
                status: 400,
                detail: validation.error,
                instance: req.originalUrl,
                timestamp: new Date().toISOString(),
            });
        }
        // Store normalized address in request for downstream handlers
        if (req.body.address) {
            req.body.address = validation.normalized;
        }
        if (req.body.musicianAddress) {
            req.body.musicianAddress = validation.normalized;
        }
        next();
    };
}
/**
 * Middleware: Validate musician name
 * Field name: musicianName or name
 */
function validateMusicianNameMiddleware() {
    return (req, res, next) => {
        const name = req.body.musicianName || req.body.name;
        if (!name) {
            return next(); // Continue if no name to validate
        }
        if (typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({
                type: 'https://fanding.dev/problems/400',
                title: 'Bad Request',
                status: 400,
                detail: 'Musician name must be a non-empty string',
                instance: req.originalUrl,
                timestamp: new Date().toISOString(),
            });
        }
        if (name.length > 100) {
            return res.status(400).json({
                type: 'https://fanding.dev/problems/400',
                title: 'Bad Request',
                status: 400,
                detail: 'Musician name cannot exceed 100 characters',
                instance: req.originalUrl,
                timestamp: new Date().toISOString(),
            });
        }
        next();
    };
}
/**
 * Middleware: Validate and generate token symbol
 * Field name: musicianName or name
 */
function validateAndGenerateSymbolMiddleware() {
    return (req, res, next) => {
        const name = req.body.musicianName || req.body.name;
        if (!name) {
            return next(); // Continue if no name to validate
        }
        try {
            const symbol = symbolGenerator_1.SymbolGenerator.generateSymbol(name, false);
            req.body.musicianSymbol = symbol;
            next();
        }
        catch (error) {
            return res.status(400).json({
                type: 'https://fanding.dev/problems/400',
                title: 'Bad Request',
                status: 400,
                detail: `Cannot generate token symbol: ${error.message}`,
                instance: req.originalUrl,
                timestamp: new Date().toISOString(),
            });
        }
    };
}
/**
 * Middleware: Validate request body is not empty
 */
function validateNonEmptyBodyMiddleware() {
    return (req, res, next) => {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                type: 'https://fanding.dev/problems/400',
                title: 'Bad Request',
                status: 400,
                detail: 'Request body cannot be empty',
                instance: req.originalUrl,
                timestamp: new Date().toISOString(),
            });
        }
        return next();
    };
}
/**
 * Middleware: Validate query parameters are of expected type
 * @param expectedParams Object mapping param names to expected types
 */
function validateQueryParamsMiddleware(expectedParams) {
    return (req, res, next) => {
        const errors = {};
        for (const [param, expectedType] of Object.entries(expectedParams)) {
            const value = req.query[param];
            if (!value) {
                errors[param] = `Query parameter '${param}' is required`;
                continue;
            }
            const actualType = Array.isArray(value) ? 'array' : typeof value;
            if (expectedType === 'address' && value) {
                const validation = walletValidator_1.WalletValidator.validateApiAddress(String(value));
                if (!validation.valid) {
                    errors[param] = validation.error || `Invalid ${param}`;
                }
            }
            else if (expectedType !== actualType) {
                errors[param] = `Parameter '${param}' must be of type ${expectedType}`;
            }
        }
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                type: 'https://fanding.dev/problems/400',
                title: 'Bad Request',
                status: 400,
                detail: 'Query parameter validation failed',
                instance: req.originalUrl,
                timestamp: new Date().toISOString(),
                errors,
            });
        }
        return next();
    };
}
/**
 * Middleware: Sanitize and normalize request data
 */
function sanitizeRequestMiddleware() {
    return (req, _res, next) => {
        // Trim string values in body
        if (req.body && typeof req.body === 'object') {
            for (const [key, value] of Object.entries(req.body)) {
                if (typeof value === 'string') {
                    req.body[key] = value.trim();
                }
            }
        }
        // Trim string values in query
        if (req.query && typeof req.query === 'object') {
            for (const [key, value] of Object.entries(req.query)) {
                if (typeof value === 'string') {
                    req.query[key] = value.trim();
                }
            }
        }
        return next();
    };
}
//# sourceMappingURL=validation.js.map