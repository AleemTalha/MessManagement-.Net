"use client"
import { useState } from 'react'
import AttendanceTable from './AttendanceTable'

const Client = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(30) // Fixed limit for now, can be made configurable later

  // Get current month and year
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1 // JavaScript months are 0-indexed
  const currentYear = currentDate.getFullYear()

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  return (
    <div className="mx-auto px-4 py-6">
      <AttendanceTable
        month={currentMonth}
        year={currentYear}
        page={currentPage}
        limit={limit}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

export default Client
