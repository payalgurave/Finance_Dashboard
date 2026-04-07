const authService = require('../services/authService');
const { log } = require('../services/activityService');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    const result = await authService.register({ name, email, password, role });
    await log(result.user.id, 'REGISTER', 'User', result.user.id, `New ${result.user.role} account registered: ${result.user.email}`);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const result = await authService.login({ email, password });
    await log(result.user.id, 'LOGIN', 'User', result.user.id, `Login from IP: ${ip} — Role: ${result.user.role}`);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getMe = (req, res) => {
  return res.status(200).json({ success: true, data: req.user });
};

module.exports = { register, login, getMe };
