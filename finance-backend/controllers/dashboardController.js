const dashboardService = require('../services/dashboardService');

const getSummary = async (req, res) => {
  try {
    const summary = await dashboardService.getSummary();
    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

module.exports = { getSummary };
