"use client";
import { useState } from "react";
import { useBills, useUpdateBillPayment, useGenerateBill } from "@/utils/useBills";
import { useUsers } from "@/utils/useUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, PencilIcon, DocumentTextIcon } from "@heroicons/react/24/solid";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

const getStatusBadge = (status) => {
  switch (status) {
    case "Pending":
      return <Badge variant="secondary">Pending</Badge>;
    case "PartiallyPaid":
      return <Badge className="bg-yellow-100 text-yellow-800">Partially Paid</Badge>;
    case "FullyPaid":
      return <Badge className="bg-green-100 text-green-800">Fully Paid</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const BillsTable = ({ page, limit, userId, userName, onPageChange, onSearch }) => {
  const { data, isLoading, isError, error, refetch } = useBills(page, limit, userId, userName);
  const { data: usersData, isLoading: isUsersLoading } = useUsers(0, 1000); // Get up to 1000 users for bill generation
  const updatePayment = useUpdateBillPayment();
  const generateBill = useGenerateBill();
  const [searchUserId, setSearchUserId] = useState(userId);
  const [searchUserName, setSearchUserName] = useState(userName);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);
  const [generateMonth, setGenerateMonth] = useState(new Date().getMonth() + 1);
  const [generateYear, setGenerateYear] = useState(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchUserId, searchUserName);
  };

  const handleUpdatePayment = async () => {
    if (!selectedBill || !paymentAmount) return;

    try {
      await updatePayment.mutateAsync({
        billId: selectedBill.id,
        paidAmount: parseFloat(paymentAmount),
      });
      setPaymentAmount("");
      setSelectedBill(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleGenerateBills = async () => {
    // Check if usersData exists and has users
    const users = usersData?.users || [];
    if (!users || users.length === 0) {
      toast.error("No users found to generate bills for");
      return;
    }

    setIsGenerating(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      toast.info(`Starting bill generation for ${users.length} users...`);

      for (const user of users) {
        try {
          await generateBill.mutateAsync({
            userId: user.id,
            month: generateMonth,
            year: generateYear
          });
          successCount++;
        } catch (error) {
          // If bill already exists, it's not an error
          if (error.message && error.message.includes("already exists")) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Failed to generate bill for user ${user.id}:`, error);
          }
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully processed bills for ${successCount} users`);
        await refetch(); // Refresh the bills list
      }
      if (errorCount > 0) {
        toast.error(`Failed to generate bills for ${errorCount} users`);
      }
    } catch (error) {
      toast.error("Error generating bills: " + (error.message || "Unknown error"));
      console.error("Error generating bills:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Error loading bills: {error?.message}</p>
        </CardContent>
      </Card>
    );
  }

  const bills = data?.bills || [];
  const pagination = data?.pagination || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bills</CardTitle>
        
        {/* Generate Bills Section */}
        <div className="flex items-center gap-4 mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <Label htmlFor="generate-month">Month:</Label>
            <Select value={generateMonth.toString()} onValueChange={(value) => setGenerateMonth(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    {new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="generate-year">Year:</Label>
            <Select value={generateYear.toString()} onValueChange={(value) => setGenerateYear(parseInt(value))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button
            onClick={handleGenerateBills}
            disabled={isGenerating || isUsersLoading || !usersData?.users || usersData.users.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <DocumentTextIcon className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : isUsersLoading ? "Loading Users..." : "Generate Bills"}
          </Button>
        </div>

        {/* Search Section */}
        <form onSubmit={handleSearchSubmit} className="flex gap-4 mt-4">
          <Input
            type="number"
            placeholder="User ID"
            value={searchUserId}
            onChange={(e) => setSearchUserId(e.target.value)}
            className="w-32"
          />
          <Input
            type="text"
            placeholder="User Name"
            value={searchUserName}
            onChange={(e) => setSearchUserName(e.target.value)}
            className="w-48"
          />
          <Button type="submit" variant="outline" size="sm">
            <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
            Search
          </Button>
        </form>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Bill Month</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Paid Amount</TableHead>
              <TableHead>Due Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{bill.userName}</p>
                    <p className="text-sm text-gray-500">ID: {bill.userId}</p>
                  </div>
                </TableCell>
                <TableCell>{new Date(bill.billMonth).toLocaleDateString()}</TableCell>
                <TableCell>{bill.totalAmount}</TableCell>
                <TableCell>{bill.paidAmount}</TableCell>
                <TableCell>{bill.dueAmount}</TableCell>
                <TableCell>{getStatusBadge(bill.status)}</TableCell>
                <TableCell>{new Date(bill.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBill(bill)}
                      >
                        <PencilIcon className="w-4 h-4 mr-1" />
                        Update Payment
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Payment for {bill.userName}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="amount">Payment Amount ()</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            placeholder="Enter amount"
                          />
                        </div>
                        <div className="text-sm text-gray-600">
                          Current Paid: {bill.paidAmount} | Due: {bill.dueAmount}
                        </div>
                        <Button
                          onClick={handleUpdatePayment}
                          disabled={updatePayment.isPending || !paymentAmount}
                          className="w-full"
                        >
                          {updatePayment.isPending ? "Updating..." : "Update Payment"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.totalCount)} of {pagination.totalCount} bills
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= pagination.totalPages}
              >
                Next
                <ChevronRightIcon className="w-4 h-4 mr-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BillsTable;