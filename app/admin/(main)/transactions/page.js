"use client";

import { useState } from "react";
import { useAdminTransactions } from "@/utils/useAdminTransactions";
import { MagnifyingGlassIcon, ArrowDownTrayIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";

export default function AdminTransactionsPage() {
  const { data: transactionsData, isLoading, error } = useAdminTransactions();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  // Ensure data is always an array
  const transactions = Array.isArray(transactionsData) ? transactionsData : [];

  const filteredAndSortedTransactions = transactions
    .filter(transaction => {
      const matchesSearch = 
        transaction.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
      const matchesMethod = methodFilter === "all" || transaction.paymentMethod === methodFilter;
      
      return matchesSearch && matchesStatus && matchesMethod;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.paymentDate) - new Date(a.paymentDate);
        case "date-asc":
          return new Date(a.paymentDate) - new Date(b.paymentDate);
        case "amount-desc":
          return b.amountPaid - a.amountPaid;
        case "amount-asc":
          return a.amountPaid - b.amountPaid;
        case "name-asc":
          return a.userName.localeCompare(b.userName);
        case "name-desc":
          return b.userName.localeCompare(a.userName);
        default:
          return 0;
      }
    });

  const handleExport = () => {
    if (!filteredAndSortedTransactions || filteredAndSortedTransactions.length === 0) return;
    
    const csv = [
      ['Date', 'User Name', 'Email', 'Transaction ID', 'Amount Paid', 'Balance', 'Method', 'Status', 'Notes'],
      ...filteredAndSortedTransactions.map(t => [
        format(new Date(t.paymentDate), 'yyyy-MM-dd HH:mm'),
        t.userName,
        t.userEmail,
        t.transactionId || 'N/A',
        `₹${t.amountPaid}`,
        `₹${t.balanceRemaining}`,
        t.paymentMethod,
        t.status,
        t.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_transactions_${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
  };

  const getStatusColor = (status) => {
    if (!status || typeof status !== 'string') return 'bg-slate-100 text-slate-700 border-slate-200';
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const totalAmount = filteredAndSortedTransactions.reduce((sum, t) => sum + (t.amountPaid || 0), 0);
  const completedTransactions = filteredAndSortedTransactions.filter(t => t.status === 'Completed').length;
  const pendingTransactions = filteredAndSortedTransactions.filter(t => t.status === 'Pending').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">Failed to load transactions. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Transactions</h1>
          <p className="text-sm text-slate-600 mt-1">
            Monitor and manage all user payment transactions
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={!filteredAndSortedTransactions || filteredAndSortedTransactions.length === 0}
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Total Transactions</h3>
          <p className="text-3xl font-bold text-slate-900">{filteredAndSortedTransactions.length}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">₹{totalAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Completed</h3>
          <p className="text-3xl font-bold text-blue-600">{completedTransactions}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Pending</h3>
          <p className="text-3xl font-bold text-amber-600">{pendingTransactions}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Filters & Search</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>

          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  User Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAndSortedTransactions && filteredAndSortedTransactions.length > 0 ? (
                filteredAndSortedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {format(new Date(transaction.paymentDate), 'MMM dd, yyyy')}
                      <br />
                      <span className="text-xs text-slate-500">
                        {format(new Date(transaction.paymentDate), 'hh:mm a')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-slate-900">{transaction.userName}</div>
                      <div className="text-xs text-slate-500">{transaction.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-700">
                      {transaction.transactionId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ₹{transaction.amountPaid?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      ₹{transaction.balanceRemaining?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {transaction.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                      {transaction.notes || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
