"use client";
import { useState } from "react";
import { useUserBills, usePayBill } from "@/utils/useUserBills";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCardIcon, CalendarIcon, CurrencyDollarIcon } from "@heroicons/react/24/solid";
import PaymentModal from "./PaymentModal";

const getStatusBadge = (status) => {
  switch (status) {
    case "Pending":
      return <Badge variant="destructive">Pending</Badge>;
    case "PartiallyPaid":
      return <Badge className="bg-yellow-100 text-yellow-800">Partially Paid</Badge>;
    case "FullyPaid":
      return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const BillsList = () => {
  const { data, isLoading, isError, error, refetch } = useUserBills();
  const payBill = usePayBill();
  const [selectedBill, setSelectedBill] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handlePayBill = (bill) => {
    setSelectedBill(bill);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (paymentData) => {
    try {
      await payBill.mutateAsync({
        billId: selectedBill.id,
        ...paymentData
      });
      setIsPaymentModalOpen(false);
      setSelectedBill(null);
      refetch(); // Refresh bills list
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-red-600 font-semibold text-lg mb-2">Error Loading Bills</p>
            <p className="text-gray-600">{error?.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const bills = data?.bills || [];

  if (bills.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <CurrencyDollarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No Outstanding Bills</p>
            <p className="text-gray-500">All your bills are paid up!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bills.map((bill) => (
          <Card key={bill.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {new Date(bill.billMonth + "-01").toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </CardTitle>
                {getStatusBadge(bill.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="font-semibold">₹{bill.totalAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Paid Amount</span>
                  <span className="text-green-600">₹{bill.paidAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Due Amount</span>
                  <span className="text-red-600 font-semibold">₹{bill.dueAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Due Date</span>
                  <span className="text-sm">
                    {new Date(bill.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {bill.notes && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  {bill.notes}
                </div>
              )}

              <Button
                onClick={() => handlePayBill(bill)}
                className="w-full"
                disabled={bill.dueAmount <= 0}
              >
                <CreditCardIcon className="w-4 h-4 mr-2" />
                Pay Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedBill(null);
        }}
        bill={selectedBill}
        onSubmit={handlePaymentSubmit}
        isPending={payBill.isPending}
      />
    </>
  );
};

export default BillsList;