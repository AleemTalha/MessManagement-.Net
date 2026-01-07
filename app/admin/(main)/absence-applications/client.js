"use client";
import { useState } from "react";
import AbsenceApplicationsList from "./AbsenceApplicationsList";

const Client = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Absence Applications</h1>
          <p className="text-gray-600 mt-2">Review and manage user absence applications</p>
        </div>
      </div>

      <AbsenceApplicationsList />
    </div>
  );
};

export default Client;