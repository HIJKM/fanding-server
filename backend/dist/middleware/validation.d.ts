import { Request, Response, NextFunction } from 'express';
/**
 * T030: Request Validation Middleware
 * Validates common request parameters and data formats
 */
/**
 * Middleware: Validate Ethereum address in request body
 * Field name: address or musicianAddress
 */
declare function validateAddressMiddleware(): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
/**
 * Middleware: Validate musician name
 * Field name: musicianName or name
 */
declare function validateMusicianNameMiddleware(): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
/**
 * Middleware: Validate and generate token symbol
 * Field name: musicianName or name
 */
declare function validateAndGenerateSymbolMiddleware(): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
/**
 * Middleware: Validate request body is not empty
 */
declare function validateNonEmptyBodyMiddleware(): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
/**
 * Middleware: Validate query parameters are of expected type
 * @param expectedParams Object mapping param names to expected types
 */
declare function validateQueryParamsMiddleware(expectedParams: {
    [key: string]: string;
}): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
/**
 * Middleware: Sanitize and normalize request data
 */
declare function sanitizeRequestMiddleware(): (req: Request, _res: Response, next: NextFunction) => void;
export { validateAddressMiddleware, validateMusicianNameMiddleware, validateAndGenerateSymbolMiddleware, validateNonEmptyBodyMiddleware, validateQueryParamsMiddleware, sanitizeRequestMiddleware, };
//# sourceMappingURL=validation.d.ts.map