import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CheckCircle, Clock, Users, TrendingUp, AlertTriangle, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';

// --- Helper Component for Stat Cards ---
const StatCard = ({ icon, title, value, change, changeType, detail, color }) => {
  const colorClasses = {
    green: { bg: 'bg-green-100', text: 'text-green-700', iconBg: 'bg-green-200' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', iconBg: 'bg-blue-200' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-700', iconBg: 'bg-purple-200' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-700', iconBg: 'bg-orange-200' },
  };
  const selectedColor = colorClasses[color] || { bg: 'bg-gray-100', text: 'text-gray-700', iconBg: 'bg-gray-200' };

  const ChangeIcon = changeType === 'up' ? ArrowUp : ArrowDown;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 transition-all hover:shadow-lg hover:border-blue-300">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-full ${selectedColor.iconBg}`}>
          {React.cloneElement(icon, { className: `w-6 h-6 ${selectedColor.text}` })}
        </div>
        <div>
           {/* Placeholder for future actions if needed */}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500">{title}</p>
        <div className="flex items-baseline space-x-2 mt-1">
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
         <div className="text-xs text-gray-500 mt-2 h-4">
            {change && (
                 <span className={`flex items-center ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    <ChangeIcon className="w-3 h-3 mr-1" /> {change}
                 </span>
            )}
            {detail}
        </div>
      </div>
    </div>
  );
};


// --- Main Performance Page Component ---
const PerformancePage = () => {

  // --- Static Data for the Components ---
  const performanceMetrics = [
    {
      icon: <CheckCircle />,
      title: 'Issues Resolved',
      value: '1',
      detail: 'This month',
      color: 'green',
    },
    {
      icon: <Clock />,
      title: 'Avg Resolution Time',
      value: '2.9 days',
      change: '↓ 0.3 from last month',
      changeType: 'down',
      color: 'blue',
    },
    {
      icon: <Users />,
      title: 'Citizen Approval',
      value: '87%',
      change: '↑ 1.5% from last month',
      changeType: 'up',
      color: 'purple',
    },
    {
      icon: <TrendingUp />,
      title: 'Resolution Rate',
      value: '94.3%',
      detail: 'Above target',
      color: 'green',
    },
    {
      icon: <AlertTriangle />,
      title: 'Pending Issues',
      value: '9',
      detail: 'High priority: 3',
      color: 'orange',
    },
  ];

  const monthlyResolutionData = [
    { name: 'Jan', Resolved: 45, Pending: 12 },
    { name: 'Feb', Resolved: 52, Pending: 8 },
    { name: 'Mar', Resolved: 38, Pending: 15 },
    { name: 'Apr', Resolved: 61, Pending: 6 },
    { name: 'May', Resolved: 48, Pending: 9 },
    { name: 'Jun', Resolved: 55, Pending: 8 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center space-x-4 mb-4">
       <img src="/parivartan_logo-removebg-preview.png" alt="Parivartan Logo" className="h-24 w-24"/>
       <h1 className="text-4xl font-bold text-gray-800 mb-4">Parivartan</h1></div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Performance Metrics</h2>
            <p className="text-base text-gray-500 mt-1">Department: Water Drainage & Clogging</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <span>This Month</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {performanceMetrics.map((metric, index) => (
            <StatCard key={index} {...metric} />
          ))}
        </div>

        {/* Chart Section */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Monthly Resolution Trend</h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyResolutionData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                barGap={8}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Resolved" fill="#64e693" name="Resolved" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Pending" fill="#e59265" name="Pending" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformancePage;
