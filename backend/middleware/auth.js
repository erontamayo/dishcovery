export function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
    return res.status(401).json({
      error: 'Unauthorized. Please log in.'
    });
  }
}

export function isAdmin(req, res, next) {
  if (
    req.session &&
    req.session.userId &&
    req.session.role === 'admin'
  ) {
    next();
  } else {
    return res.status(403).json({
      error: 'Forbidden. Admin access required.'
    });
  }
}