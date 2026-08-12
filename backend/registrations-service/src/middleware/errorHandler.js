export const errorHandler = (err, req, res, next) => {
  console.error(`[registrations-service ERROR] ${err.stack || err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur serveur interne dans registrations-service',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
