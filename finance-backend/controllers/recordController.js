const recordService = require('../services/recordService');
const { log } = require('../services/activityService');

const getAll = async (req, res) => {
  try {
    const result = await recordService.getAll(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const record = await recordService.getById(req.params.id);
    return res.status(200).json({ success: true, data: record });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { amount, type, category, date, notes } = req.body;
    if (!amount || !type || !category)
      return res.status(400).json({ success: false, message: 'Amount, type and category are required' });
    if (!['income', 'expense'].includes(type))
      return res.status(400).json({ success: false, message: 'Type must be income or expense' });
    const record = await recordService.create({ amount, type, category, date, notes }, req.user._id);
    await log(req.user._id, 'CREATE_RECORD', 'Record', record._id, `Created ${type} record: ${category} - ₹${amount}`);
    return res.status(201).json({ success: true, data: record });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const record = await recordService.update(req.params.id, req.body);
    await log(req.user._id, 'UPDATE_RECORD', 'Record', record._id, `Updated record: ${record.category} - ₹${record.amount}`);
    return res.status(200).json({ success: true, data: record });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await recordService.softDelete(req.params.id);
    await log(req.user._id, 'DELETE_RECORD', 'Record', req.params.id, `Deleted record ID: ${req.params.id}`);
    return res.status(200).json({ success: true, message: 'Record deleted successfully' });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const exportCSV = async (req, res) => {
  try {
    const csv = await recordService.exportCSV(req.query);
    await log(req.user._id, 'EXPORT_CSV', 'Record', null, 'Exported records as CSV');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="records.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove, exportCSV };
