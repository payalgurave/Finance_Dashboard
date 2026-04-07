const ActivityLog = require('../models/ActivityLog');

const log = async (userId, action, entity, entityId, details) => {
  try {
    await ActivityLog.create({ user: userId, action, entity, entityId, details });
  } catch (_) {}
};

const getAll = async () =>
  ActivityLog.find().populate('user', 'name email role').sort({ createdAt: -1 }).limit(50);

module.exports = { log, getAll };
