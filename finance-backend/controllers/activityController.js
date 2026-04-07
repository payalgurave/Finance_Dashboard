const activityService = require('../services/activityService');

const getLogs = async (req, res) => {
  try {
    const logs = await activityService.getAll();
    return res.status(200).json({ success: true, data: logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getLogs };
