const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const register = async (data) => {
  const user = await User.create(data);
  const token = signToken(user._id);
  return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }
  if (user.status === 'inactive') {
    const err = new Error('Account is inactive');
    err.statusCode = 403;
    throw err;
  }
  const token = signToken(user._id);
  return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
};

module.exports = { register, login };
