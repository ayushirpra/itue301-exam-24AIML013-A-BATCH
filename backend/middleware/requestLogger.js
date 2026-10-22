/**
 * Global request logger.
 * Logs the HTTP method, path, and a timestamp for every incoming request.
 */
function requestLogger(req, res, next) {
  const time = new Date().toISOString();
  console.log(`[${time}] ${req.method} ${req.originalUrl}`);
  next();
}

module.exports = requestLogger;
