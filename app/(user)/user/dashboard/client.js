"use client";

import { useEffect, useState } from "react";
import { useUserTransactions } from "@/utils/useUserTransactions";
import { useUserBills } from "@/utils/useUserBills";
import { useUserAttendance } from "@/utils/useUserAttendance";
import {
  BanknotesIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function UserDashboardClient() {
  const [user, setUser] = useState(null);
  const { data: transactionsData } = useUserTransactions();
  const { data: billsData } = useUserBills();
  const { data: attendanceData } = useUserAttendance();

  // Ensure data is always an array
  const transactions = Array.isArray(transactionsData) ? transactionsData : [];
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
  const totalTransactions = transactions.length;
  const totalAmountPaid = transactions.reduce((sum, t) => sum + (t.amountPaid || 0), 0);
  const currentBalance = transactions[0]?.balanceRemaining || 0;
  const pendingBills = bills.filter(b => b.status === 'Pending').length;
  const completedTransactions = transactions.filter(t => t.status === 'Completed').length;
  
  // Monthly spending trend (last 6 months)
  const monthlySpending = [];
  for (let i = 5; i >= 0; i--) {
    const month = subMonths(new Date(), i);
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const spending = transactions.filter(t => {
      const date = new Date(t.paymentDate);
      return date >= monthStart && date <= monthEnd;
    }).reduce((sum, t) => sum + t.amountPaid, 0);
    
    monthlySpending.push({
      month: format(month, 'MMM yyyy'),
      spending: spending,
      transactions: transactions.filter(t => {
        const date = new Date(t.paymentDate);
        return date >= monthStart && date <= monthEnd;
      }).length
    });
  }

  // Payment method distribution
  const paymentMethods = transactions.reduce((acc, t) => {
    acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + 1;
    return acc;
  }, {});
  
  const paymentMethodData = Object.entries(paymentMethods).map(([name, value]) => ({
    name,
    value
  }));

  // Transaction status distribution
  const statusData = [
    { name: 'Completed', value: transactions.filter(t => t.status === 'Completed').length },
    { name: 'Pending', value: transactions.filter(t => t.status === 'Pending').length },
    { name: 'Failed', value: transactions.filter(t => t.status === 'Failed').length },
  ].filter(item => item.value > 0);

  // Daily spending pattern (last 30 days)
  const last30Days = eachDayOfInterval({
    start: subMonths(new Date(), 1),
    end: new Date()
  });
  
  const dailySpending = last30Days.map(day => {
    const dayTransactions = transactions.filter(t => 
      isSameDay(new Date(t.paymentDate), day)
    );
    return {
      date: format(day, 'MMM dd'),
      amount: dayTransactions.reduce((sum, t) => sum + t.amountPaid, 0),
      count: dayTransactions.length
    };
  });

  // Weekly comparison
  const weeklyData = [
    // eslint-disable-next-line react-hooks/purity
    { day: 'Mon', spending: Math.random() * 500 + 200, attendance: 85 },
    // eslint-disable-next-line react-hooks/purity
    { day: 'Tue', spending: Math.random() * 500 + 200, attendance: 90 },
    // eslint-disable-next-line react-hooks/purity
    { day: 'Wed', spending: Math.random() * 500 + 200, attendance: 88 },
    // eslint-disable-next-line react-hooks/purity
    { day: 'Thu', spending: Math.random() * 500 + 200, attendance: 92 },
    // eslint-disable-next-line react-hooks/purity
    { day: 'Fri', spending: Math.random() * 500 + 200, attendance: 87 },
    // eslint-disable-next-line react-hooks/purity
    { day: 'Sat', spending: Math.random() * 500 + 200, attendance: 75 },
    // eslint-disable-next-line react-hooks/purity
    { day: 'Sun', spending: Math.random() * 500 + 200, attendance: 70 },
  ];

  // Meal consumption pattern
  const mealData = [
    { meal: 'Breakfast', attended: 24, missed: 6, subject: 'Breakfast', A: 80, fullMark: 100 },
    { meal: 'Lunch', attended: 28, missed: 2, subject: 'Lunch', A: 93, fullMark: 100 },
    { meal: 'Dinner', attended: 26, missed: 4, subject: 'Dinner', A: 87, fullMark: 100 },
  ];

  // Balance trend
  const balanceTrend = transactions.slice(0, 10).reverse().map((t, idx) => ({
    transaction: `T${idx + 1}`,
    balance: t.balanceRemaining,
    payment: t.amountPaid
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-linear-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-blue-100">
          Here&apos;s your comprehensive mess management dashboard
        </p>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BanknotesIcon className="w-6 h-6 text-green-600" />
            </div>
            <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-slate-600 text-sm font-medium mb-1">Current Balance</h3>
          <p className="text-2xl font-bold text-slate-900">₹{currentBalance.toFixed(2)}</p>
          <p className="text-xs text-green-600 mt-1">Available funds</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
            </div>
            {pendingBills > 0 ? (
              <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            )}
          </div>
          <h3 className="text-slate-600 text-sm font-medium mb-1">Pending Bills</h3>
          <p className="text-2xl font-bold text-slate-900">{pendingBills}</p>
          <p className="text-xs text-slate-500 mt-1">Requires attention</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <ArrowTrendingUpIcon className="w-5 h-5 text-purple-500" />
          </div>
          <h3 className="text-slate-600 text-sm font-medium mb-1">Total Transactions</h3>
          <p className="text-2xl font-bold text-slate-900">{totalTransactions}</p>
          <p className="text-xs text-purple-600 mt-1">{completedTransactions} completed</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-amber-600" />
            </div>
            <ArrowTrendingDownIcon className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-slate-600 text-sm font-medium mb-1">Total Spent</h3>
          <p className="text-2xl font-bold text-slate-900">₹{totalAmountPaid.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">All time</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending Trend */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Monthly Spending Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlySpending}>
              <defs>
                <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="spending" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSpending)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Method Distribution */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment Methods</h2>
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Spending Pattern */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Daily Spending (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailySpending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Transaction Status */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Transaction Status</h2>
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

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Weekly Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="spending" fill="#3b82f6" name="Spending (₹)" />
              <Bar yAxisId="right" dataKey="attendance" fill="#10b981" name="Attendance (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Meal Consumption Radar */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Meal Attendance Pattern</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mealData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar name="Attendance %" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Trend */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Balance Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={balanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="transaction" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="balance" stroke="#f59e0b" strokeWidth={2} name="Balance (₹)" />
              <Line type="monotone" dataKey="payment" stroke="#ef4444" strokeWidth={2} name="Payment (₹)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Transaction Count by Month */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Transaction Volume</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySpending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="transactions" fill="#06b6d4" name="Transactions" />
            </BarChart>
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
                    <p className="font-medium text-slate-900">{transaction.paymentMethod}</p>
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

        {/* Pending Bills */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Pending Bills</h2>
          <div className="space-y-3">
            {bills.filter(b => b.status === 'Pending').slice(0, 5).map((bill, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircleIcon className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Bill #{bill.id}</p>
                    <p className="text-xs text-slate-500">Due: {format(new Date(bill.dueDate || new Date()), 'MMM dd')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">₹{bill.totalAmount?.toFixed(2)}</p>
                  <span className="text-xs text-red-600">Pending</span>
                </div>
              </div>
            ))}
            {bills.filter(b => b.status === 'Pending').length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>No pending bills</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-linear-to-r from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-slate-200">
            <BanknotesIcon className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-medium text-slate-700">Make Payment</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-slate-200">
            <ClipboardDocumentListIcon className="w-8 h-8 text-green-600" />
            <span className="text-sm font-medium text-slate-700">View Bills</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-slate-200">
            <CalendarDaysIcon className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-medium text-slate-700">Check Attendance</span>
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
