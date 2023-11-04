// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.verifyStudent = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).redirect('/student/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.student = decoded;
    next();
  } catch (error) {
    res.status(401).redirect('/student/login');
  }
};
exports.verifyAdmin = (req, res, next) => {
  const token = req.cookies.admin_jwt; // Assuming admin JWT is stored in a cookie named 'admin_jwt'
  if (!token) {
    return res.status(403).render('admin/login', { message: 'Please log in to continue' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).render('admin/login', { message: 'Session expired, please log in again' });
  }
};

