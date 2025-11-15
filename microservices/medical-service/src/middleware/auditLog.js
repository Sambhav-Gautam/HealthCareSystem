const AuditLog = require('../models/AuditLog');

const logAudit = async (userId, action, details = {}) => {
  try {
    await AuditLog.create({
      userId,
      action,
      resourceType: details.resourceType,
      resourceId: details.resourceId,
      changes: details.changes,
      ipAddress: details.ipAddress,
      userAgent: details.userAgent,
      status: details.status || 'success',
      errorMessage: details.errorMessage,
      metadata: details.metadata,
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

const auditMiddleware = (action) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = function (body) {
      const userId = req.user?.id || req.body?.userId;
      
      if (userId) {
        logAudit(userId, action, {
          resourceType: req.params.id ? req.baseUrl.split('/').pop() : undefined,
          resourceId: req.params.id,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          status: body.success ? 'success' : 'failure',
          errorMessage: body.error,
          metadata: {
            method: req.method,
            path: req.path,
            query: req.query,
          },
        });
      }
      
      return originalJson(body);
    };
    
    next();
  };
};

module.exports = { logAudit, auditMiddleware };


