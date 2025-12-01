/**
 * T029: API Error Response Formatter
 * Formats errors according to RFC 9457 Problem Details for HTTP APIs
 */
interface ProblemDetail {
    type: string;
    title: string;
    status: number;
    detail: string;
    instance: string;
    timestamp?: string;
    code?: string;
    errors?: any;
}
/**
 * Get standard title for HTTP status code
 * @param statusCode HTTP status code
 * @returns Standard title or 'Unknown Error'
 */
declare function getTitleForStatus(statusCode: number): string;
/**
 * Format error according to RFC 9457 Problem Details
 * @param error Error object or message
 * @param statusCode HTTP status code (default: 500)
 * @param instance Request path or instance identifier
 * @returns RFC 9457 compliant error object
 */
declare function formatError(error: Error | string | any, statusCode?: number, instance?: string): ProblemDetail;
/**
 * Format validation errors for API response
 * @param validationErrors Object mapping field names to error messages
 * @param statusCode HTTP status code (default: 422)
 * @param instance Request path or instance identifier
 * @returns RFC 9457 compliant error object with validation details
 */
declare function formatValidationError(validationErrors: {
    [key: string]: string | string[];
}, statusCode?: number, instance?: string): ProblemDetail;
/**
 * Format blockchain-related errors
 * @param error Error from blockchain operation
 * @param operation Name of the blockchain operation
 * @param instance Request path or instance identifier
 * @returns RFC 9457 compliant error object with blockchain context
 */
declare function formatBlockchainError(error: Error | any, operation: string, instance?: string): ProblemDetail;
export { formatError, formatValidationError, formatBlockchainError, getTitleForStatus, ProblemDetail, };
//# sourceMappingURL=apiErrorFormatter.d.ts.map