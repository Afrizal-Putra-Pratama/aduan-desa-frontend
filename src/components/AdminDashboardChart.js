import React from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function AdminDashboardChart({ data, stats }) {
  const hasData = data && data.length > 0;

  // Format data for line chart
  const formattedLineData = hasData ? data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short' 
    })
  })) : [];

  // Format data for pie chart
  const pieData = [
    { name: 'Menunggu', value: stats.pending, color: '#eab308' },
    { name: 'Diproses', value: stats.in_progress, color: '#3b82f6' },
    { name: 'Selesai', value: stats.completed, color: '#22c55e' },
    { name: 'Ditolak', value: stats.rejected, color: '#ef4444' }
  ];

  if (!hasData) {
    return (
      <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-2xl shadow-md p-8 text-center transition-colors">
        <p className="text-slate-500 dark:text-slate-400">Tidak ada data untuk ditampilkan</p>
      </div>
    );
  }

  // Custom Tooltip for Dark Mode
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs text-slate-600 dark:text-slate-300">
              <span style={{ color: entry.color }}>{entry.name}:</span> {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Line Chart */}
      <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl shadow-md p-4 transition-colors">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3">Tren Pengaduan (30 Hari)</h3>
        
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={formattedLineData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700 dark:text-slate-300" />
            <XAxis 
              dataKey="date" 
              stroke="currentColor"
              className="text-slate-600 dark:text-slate-400"
              style={{ fontSize: '10px' }}
            />
            <YAxis 
              stroke="currentColor"
              className="text-slate-600 dark:text-slate-400"
              style={{ fontSize: '10px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }}
              iconType="line"
            />
            
            {/* Total Line - Indigo */}
            <Line 
              type="monotone" 
              dataKey="total" 
              name="Total" 
              stroke="#4f46e5" 
              strokeWidth={2.5}
              dot={{ fill: '#4f46e5', r: 2 }}
              activeDot={{ r: 4 }}
            />
            
            {/* Completed Line - Green */}
            <Line 
              type="monotone" 
              dataKey="completed" 
              name="Selesai" 
              stroke="#22c55e" 
              strokeWidth={2}
              dot={{ fill: '#22c55e', r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl shadow-md p-4 transition-colors">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3">Distribusi Status</h3>
        
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={false}
              outerRadius={95}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AdminDashboardChart;
