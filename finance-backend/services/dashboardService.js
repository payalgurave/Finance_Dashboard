const FinancialRecord = require('../models/FinancialRecord');

const getSummary = async () => {
  const [totals, categoryTotals, recentActivity, monthlyTrends] = await Promise.all([
    // Total income, expense, net balance
    FinancialRecord.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]),

    // Category-wise totals
    FinancialRecord.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]),

    // Recent 5 transactions
    FinancialRecord.find()
      .populate('createdBy', 'name')
      .sort({ date: -1 })
      .limit(5)
      .select('amount type category date notes'),

    // Monthly trends (last 6 months)
    FinancialRecord.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]),
  ]);

  const income = totals.find((t) => t._id === 'income')?.total || 0;
  const expense = totals.find((t) => t._id === 'expense')?.total || 0;

  return {
    totalIncome: income,
    totalExpenses: expense,
    netBalance: income - expense,
    categoryTotals,
    recentActivity,
    monthlyTrends,
  };
};

module.exports = { getSummary };
