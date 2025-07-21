// back/utils/errors.js
class APIError extends Error {
  constructor(message, { cause, details } = {}) {
    super(message);
    this.name = 'APIError';
    this.cause = cause;
    this.details = details;
    this.isCustomError = true;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }
}

module.exports = {
  APIError
};