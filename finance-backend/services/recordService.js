const FinancialRecord = require('../models/FinancialRecord');

const buildFilter = ({ type, category, startDate, endDate, search }) => {
  const filter = {};
  if (type) filter.type = type;
  if (category) filter.category = { $regex: category, $options: 'i' };
  if (search) filter.$or = [
    { category: { $regex: search, $options: 'i' } },
    { notes: { $regex: search, $options: 'i' } },
  ];
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  return filter;
};

const getAll = async (query) => {
  const { page = 1, limit = 10, ...filters } = query;
  const filter = buildFilter(filters);
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    FinancialRecord.find(filter)
      .populate('createdBy', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit)),
    FinancialRecord.countDocuments(filter),
  ]);

  return { records, total, page: Number(page), pages: Math.ceil(total / limit) };
};

const getById = async (id) => {
  const record = await FinancialRecord.findById(id).populate('createdBy', 'name email');
  if (!record) {
    const err = new Error('Record not found');
    err.statusCode = 404;
    throw err;
  }
  return record;
};

const create = async (data, userId) => {
  return FinancialRecord.create({ ...data, createdBy: userId });
};

const update = async (id, data) => {
  const record = await FinancialRecord.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!record) {
    const err = new Error('Record not found');
    err.statusCode = 404;
    throw err;
  }
  return record;
};

const softDelete = async (id) => {
  const record = await FinancialRecord.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!record) {
    const err = new Error('Record not found');
    err.statusCode = 404;
    throw err;
  }
  return record;
};

const exportCSV = async (query) => {
  const filter = buildFilter(query);
  const records = await FinancialRecord.find(filter)
    .populate('createdBy', 'name')
    .sort({ date: -1 });

  const header = 'Date,Type,Category,Amount,Notes,Created By';
  const rows = records.map((r) =>
    [
      new Date(r.date).toLocaleDateString('en-IN'),
      r.type,
      `"${r.category}"`,
      r.amount,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
      r.createdBy?.name || '',
    ].join(',')
  );
  return [header, ...rows].join('\n');
};

module.exports = { getAll, getById, create, update, softDelete, exportCSV };
