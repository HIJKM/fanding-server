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
 * Standard HTTP status code to title mapping
 */
const STATUS_TITLES: { [key: number]: string } = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
};

/**
 * Get standard title for HTTP status code
 * @param statusCode HTTP status code
 * @returns Standard title or 'Unknown Error'
 */
function getTitleForStatus(statusCode: number): string {
  return STATUS_TITLES[statusCode] || 'Unknown Error';
}

/**
 * Format error according to RFC 9457 Problem Details
 * @param error Error object or message
 * @param statusCode HTTP status code (default: 500)
 * @param instance Request path or instance identifier
 * @returns RFC 9457 compliant error object
 */
function formatError(
  error: Error | string | any,
  statusCode: number = 500,
  instance: string = '/'
): ProblemDetail {
  const timestamp = new Date().toISOString();
  const errorMessage = typeof error === 'string' ? error : error?.message || 'Internal Server Error';

  const problemDetail: ProblemDetail = {
    type: `https://fanding.dev/problems/${statusCode}`,
    title: getTitleForStatus(statusCode),
    status: statusCode,
    detail: errorMessage,
    instance,
    timestamp,
  };

  // Add error code if present
  if (error?.code) {
    problemDetail.code = error.code;
  }

  // Add validation errors if present
  if (error?.errors) {
    problemDetail.errors = error.errors;
  }

  // Add custom type if present
  if (error?.type) {
    problemDetail.type = error.type;
  }

  return problemDetail;
}

/**
 * Format validation errors for API response
 * @param validationErrors Object mapping field names to error messages
 * @param statusCode HTTP status code (default: 422)
 * @param instance Request path or instance identifier
 * @returns RFC 9457 compliant error object with validation details
 */
function formatValidationError(
  validationErrors: { [key: string]: string | string[] },
  statusCode: number = 422,
  instance: string = '/'
): ProblemDetail {
  const timestamp = new Date().toISOString();

  return {
    type: `https://fanding.dev/problems/${statusCode}`,
    title: getTitleForStatus(statusCode),
    status: statusCode,
    detail: 'Validation failed',
    instance,
    timestamp,
    errors: validationErrors,
  };
}

/**
 * Format blockchain-related errors
 * @param error Error from blockchain operation
 * @param operation Name of the blockchain operation
 * @param instance Request path or instance identifier
 * @returns RFC 9457 compliant error object with blockchain context
 */
function formatBlockchainError(
  error: Error | any,
  operation: string,
  instance: string = '/'
): ProblemDetail {
  const errorMessage = error?.message || 'Blockchain operation failed';
  const statusCode = error?.statusCode || 500;
  const timestamp = new Date().toISOString();

  return {
    type: `https://fanding.dev/problems/blockchain-error`,
    title: 'Blockchain Operation Failed',
    status: statusCode,
    detail: `${operation}: ${errorMessage}`,
    instance,
    timestamp,
    code: error?.code || 'BLOCKCHAIN_ERROR',
  };
}

export {
  formatError,
  formatValidationError,
  formatBlockchainError,
  getTitleForStatus,
  ProblemDetail,
};
