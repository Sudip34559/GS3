export default function isAdmin(req, res, next) {
  // Check if user is authenticated and has the admin role
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      message: "Access denied. Only admin is allowed."
    });
  }
  
  // User is admin, proceed
  next();
}
