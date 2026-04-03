const userService = require('../services/userService');

const getAll = async (req, res) => {
  try {
    const users = await userService.getAll();
    return res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const user = await userService.getById(req.params.id);
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot modify your own account' });
    }
    const user = await userService.update(req.params.id, req.body);
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }
    await userService.remove(req.params.id);
    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getOne, update, remove };
