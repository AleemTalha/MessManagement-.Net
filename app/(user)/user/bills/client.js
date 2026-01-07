"use client";
import { useState } from "react";
import BillsList from "./BillsList";

const Client = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bills</h1>
          <p className="text-gray-600 mt-2">View and pay your outstanding bills</p>
        </div>
      </div>

      <BillsList />
    </div>
  );
};

export default Client;