"use client";
import { useState } from "react";
import BillsTable from "./BillsTable";

const Client = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearch = (newUserId, newUserName) => {
    setUserId(newUserId);
    setUserName(newUserName);
    setCurrentPage(1); // Reset to first page on search
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bill Management</h1>
          <p className="text-gray-600 mt-2">View and manage user bills</p>
        </div>
      </div>

      <BillsTable
        page={currentPage}
        limit={limit}
        userId={userId}
        userName={userName}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
      />
    </div>
  );
};

export default Client;