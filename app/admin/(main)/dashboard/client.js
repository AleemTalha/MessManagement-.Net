"use client";

import { useEffect, useState } from "react";
import { useAdminTransactions } from "@/utils/useAdminTransactions";
import { useUsers } from "@/utils/useUsers";
import { useBills } from "@/utils/useBills";
import { useAttendance } from "@/utils/useAttendance";
import {
  UsersIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/solid";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subDays } from "date-fns";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function AdminDashboardClient() {
  const [user, setUser] = useState(null);
  const { data: transactionsData } = useAdminTransactions();
  const { data: usersData } = useUsers();
  const { data: billsData } = useBills();
  const { data: attendanceData } = useAttendance();

  // Ensure data is always an array
  const transactions = Array.isArray(transactionsData) ? transactionsData : [];
  const users = Array.isArray(usersData) ? usersData : [];
  const bills = Array.isArray(billsData) ? billsData : [];
  const attendance = Array.isArray(attendanceData) ? attendanceData : [];

  useEffect(() => {
    const getUserFromToken = () => {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1];

      if (token) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const decoded = JSON.parse(jsonPayload);
          return {
            name: decoded.name,
            email: decoded.email,
            role: decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
          };
        } catch (error) {
          console.error('Error decoding token:', error);
          return null;
        }
      }
      return null;
    };

    const userData = getUserFromToken();
    if (userData) {
      setUser(userData);
    }
  }, []);

  // Calculate statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const totalRevenue = transactions.reduce((sum, t) => sum + (t.amountPaid || 0), 0);
  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(t => t.status === 'Completed').length;
  const pendingBills = bills.filter(b => b.status === 'Pending').length;
  const totalBills = bills.length;
  
  // Monthly revenue trend (last 6 months)
  const monthlyRevenue = [];
  for (let i = 5; i >= 0; i--) {
    const month = subMonths(new Date(), i);
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const revenue = transactions.filter(t => {
      const date = new Date(t.paymentDate);
      return date >= monthStart && date <= monthEnd;
    }).reduce((sum, t) => sum + t.amountPaid, 0);
    
    const transactionCount = transactions.filter(t => {
      const date = new Date(t.paymentDate);
      return date >= monthStart && date <= monthEnd;
    }).length;
    
    monthlyRevenue.push({
      month: format(month, 'MMM yyyy'),
      revenue: revenue,
      transactions: transactionCount,
    // eslint-disable-next-line react-hooks/purity
      users: Math.floor(Math.random() * 20) + 40 // Mock data for user activity
    });
  }

  // Payment method distribution
  const paymentMethods = transactions.reduce((acc, t) => {
    acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.amountPaid;
    return acc;
  }, {});
  
  const paymentMethodData = Object.entries(paymentMethods).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2))
  }));

  // User distribution by status
  const userStatusData = [
    { name: 'Active', value: users.filter(u => u.status === 'Active').length },
    { name: 'Inactive', value: users.filter(u => u.status === 'Inactive').length },
    { name: 'Suspended', value: users.filter(u => u.status === 'Suspended').length },
  ].filter(item => item.value > 0);

  // Daily revenue (last 30 days)
  const last30Days = eachDayOfInterval({
    start: subMonths(new Date(), 1),
    end: new Date()
  });
  
  const dailyRevenue = last30Days.map(day => {
    const dayTransactions = transactions.filter(t => 
      isSameDay(new Date(t.paymentDate), day)
    );
    return {
      date: format(day, 'MMM dd'),
      revenue: dayTransactions.reduce((sum, t) => sum + t.amountPaid, 0),
      transactions: dayTransactions.length
    };
  });

  // Transaction status distribution
  const statusData = [
    { name: 'Completed', value: transactions.filter(t => t.status === 'Completed').length, amount: transactions.filter(t => t.status === 'Completed').reduce((sum, t) => sum + t.amountPaid, 0) },
    { name: 'Pending', value: transactions.filter(t => t.status === 'Pending').length, amount: transactions.filter(t => t.status === 'Pending').reduce((sum, t) => sum + t.amountPaid, 0) },
    { name: 'Failed', value: transactions.filter(t => t.status === 'Failed').length, amount: transactions.filter(t => t.status === 'Failed').reduce((sum, t) => sum + t.amountPaid, 0) },
  ].filter(item => item.value > 0);

  // Top users by spending
  const userSpending = transactions.reduce((acc, t) => {
    if (!acc[t.userId]) {
      acc[t.userId] = {
        name: t.userName,
        email: t.userEmail,
        totalSpent: 0,
        transactionCount: 0
      };
    }
    acc[t.userId].totalSpent += t.amountPaid;
    acc[t.userId].transactionCount += 1;
    return acc;
  }, {});
  
  const topUsers = Object.values(userSpending)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10)
    .map(u => ({
      name: u.name,
      spent: parseFloat(u.totalSpent.toFixed(2)),
      transactions: u.transactionCount
    }));

  // Weekly comparison
  const weeklyData = [
    // eslint-disable-next-line react-hooks/purity
    { day: 'Mon', revenue: Math.random() * 5000 + 2000, transactions: Math.floor(Math.random() * 30) + 20 },
    // eslint-disable-next-line react-hooks/purity
    { day: 'Tue', revenue: Math.random() * 5000 + 2000, transactions: Math.floor(Math.random() * 30) + 20 },
    // eslint-disable-next-line react-hooks/purity
    { day: 'Wed', revenue: Math.random() * 5000 + 2000, transactions: Math.floor(Math.random() * 30) + 20 },
    // eslint-disable-next-line react-hooks/purity
    { day: 'Thu', revenue: Math.random() * 5000 + 2000, transactions: Math.floor(Math.random() * 30) + 20 },
    // eslint-disable-next-line react-hooks/purity
    { day: 'Fri', revenue: Math.random() * 5000 + 2000, transactions: Math.floor(Math.random() * 30) + 20 },
    // eslint-disable-next-line react-hooks/purity
    { day: 'Sat', revenue: Math.random() * 5000 + 2000, transactions: Math.floor(Math.random() * 30) + 20 },
    // eslint-disable-next-line react-hooks/purity
    { day: 'Sun', revenue: Math.random() * 5000 + 2000, transactions: Math.floor(Math.random() * 30) + 20 },
  ];

  // Bill status distribution
  const billStatusData = [
    { name: 'Paid', value: bills.filter(b => b.status === 'Paid').length },
    { name: 'Pending', value: bills.filter(b => b.status === 'Pending').length },
    { name: 'Overdue', value: bills.filter(b => b.status === 'Overdue').length },
  ].filter(item => item.value > 0);

  // Revenue vs Expenses comparison
  const revenueExpenseData = monthlyRevenue.map(m => ({
    month: m.month,
    revenue: m.revenue,
    // eslint-disable-next-line react-hooks/purity
    expenses: m.revenue * 0.7 + Math.random() * 1000, // Mock data
    profit: m.revenue - (m.revenue * 0.7)
  }));

  // Hourly transaction pattern
  const hourlyPattern = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    // eslint-disable-next-line react-hooks/purity
    transactions: Math.floor(Math.random() * 15) + 1,
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-linear-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Admin Dashboard
        </h1>
        <p className="text-purple-100">
          Complete overview of your mess management system
        </p>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
            <ArrowTrendingUpIcon className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="text-slate-600 text-sm font-medium mb-1">Total Users</h3>
          <p className="text-2xl font-bold text-slate-900">{totalUsers}</p>
          <p className="text-xs text-blue-600 mt-1">{activeUsers} active</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            </div>
            <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-slate-600 text-sm font-medium mb-1">Total Revenue</h3>
          <p className="text-2xl font-bold text-slate-900">₹{totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-green-600 mt-1">All time</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BanknotesIcon className="w-6 h-6 text-purple-600" />
            </div>
            <ArrowTrendingUpIcon className="w-5 h-5 text-purple-500" />
          </div>
          <h3 className="text-slate-600 text-sm font-medium mb-1">Transactions</h3>
          <p className="text-2xl font-bold text-slate-900">{totalTransactions}</p>
          <p className="text-xs text-purple-600 mt-1">{completedTransactions} completed</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-6 h-6 text-amber-600" />
            </div>
            {pendingBills > 0 ? (
              <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            )}
          </div>
          <h3 className="text-slate-600 text-sm font-medium mb-1">Pending Bills</h3>
          <p className="text-2xl font-bold text-slate-900">{pendingBills}</p>
          <p className="text-xs text-slate-500 mt-1">of {totalBills} total</p>
        </div>
      </div>

      {/* Charts Row 1: Revenue Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Monthly Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Method Distribution */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment Methods Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: Transaction Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Daily Revenue (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} name="Revenue (₹)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Transaction Status */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Transaction Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 3: User Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users by Spending */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Top 10 Users by Spending</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topUsers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="spent" fill="#8b5cf6" name="Total Spent (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Status Distribution */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">User Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {userStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 4: Weekly & Bill Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Performance */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Weekly Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue (₹)" />
              <Line yAxisId="right" type="monotone" dataKey="transactions" stroke="#10b981" strokeWidth={2} name="Transactions" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Bill Status */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Bill Status Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={billStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#f59e0b" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 5: Advanced Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Revenue vs Expenses Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueExpenseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" name="Revenue" />
              <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly Transaction Pattern */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Hourly Transaction Pattern</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyPattern}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="transactions" fill="#06b6d4" name="Transactions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 6: Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Transaction Volume */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Monthly Transaction Volume</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="transactions" fill="#8b5cf6" name="Transactions" />
              <Bar dataKey="users" fill="#ec4899" name="Active Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Growth Rate */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Monthly Metrics Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue (₹)" />
              <Line yAxisId="right" type="monotone" dataKey="transactions" stroke="#3b82f6" strokeWidth={2} name="Transactions" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.status === 'Completed' ? 'bg-green-100' : 'bg-amber-100'
                  }`}>
                    {transaction.status === 'Completed' ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    ) : (
                      <ClockIcon className="w-5 h-5 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{transaction.userName}</p>
                    <p className="text-xs text-slate-500">{format(new Date(transaction.paymentDate), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">₹{transaction.amountPaid?.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    transaction.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Statistics */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">System Statistics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <UsersIcon className="w-8 h-8 text-blue-600" />
                <span className="font-medium text-slate-900">Active Users</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{activeUsers}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
                <span className="font-medium text-slate-900">Completed Transactions</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{completedTransactions}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CurrencyDollarIcon className="w-8 h-8 text-purple-600" />
                <span className="font-medium text-slate-900">Average Transaction</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">
                ₹{totalTransactions > 0 ? (totalRevenue / totalTransactions).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-3">
                <ClipboardDocumentListIcon className="w-8 h-8 text-amber-600" />
                <span className="font-medium text-slate-900">Total Bills</span>
              </div>
              <span className="text-2xl font-bold text-amber-600">{totalBills}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-linear-to-r from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-slate-200">
            <UsersIcon className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-medium text-slate-700">Manage Users</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-slate-200">
            <BanknotesIcon className="w-8 h-8 text-green-600" />
            <span className="text-sm font-medium text-slate-700">View Transactions</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-slate-200">
            <ClipboardDocumentListIcon className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-medium text-slate-700">Generate Bills</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-slate-200">
            <ChartBarIcon className="w-8 h-8 text-amber-600" />
            <span className="text-sm font-medium text-slate-700">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
}
