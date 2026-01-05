"use client"
import { useState } from 'react'
import AttendanceTable from './AttendanceTable'

const Client = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(30)

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  return (
    <div className="">
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
