const StatCard = ({ label, value, color, prefix = '₹' }) => (
  <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5`}>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>
      {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '—'}
    </p>
  </div>
);

export default StatCard;
