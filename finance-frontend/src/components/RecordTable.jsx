const Badge = ({ type }) => (
  <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
    type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
    {type}
  </span>
);

const RecordTable = ({ records, onEdit, onDelete, isAdmin }) => {
  if (!records?.length)
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-300">
        <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm">No records found</p>
      </div>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {['Date', 'Type', 'Category', 'Amount', 'Notes', ...(isAdmin ? ['Actions'] : [])].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td className="px-4 py-4 text-gray-500 text-sm">
                {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </td>
              <td className="px-4 py-4"><Badge type={r.type} /></td>
              <td className="px-4 py-4">
                <span className="font-medium text-gray-800">{r.category}</span>
              </td>
              <td className={`px-4 py-4 font-bold text-sm ${r.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                {r.type === 'income' ? '+' : '-'}₹{r.amount.toLocaleString('en-IN')}
              </td>
              <td className="px-4 py-4 text-gray-400 max-w-xs truncate">{r.notes || '—'}</td>
              {isAdmin && (
                <td className="px-4 py-4">
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEdit(r)}
                      className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(r._id)}
                      className="px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecordTable;
