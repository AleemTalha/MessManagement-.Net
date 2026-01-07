"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCardIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";

const PaymentModal = ({ isOpen, onClose, bill, onSubmit, isPending }) => {
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentMethod: "Card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (bill && isOpen) {
      setPaymentData(prev => ({
        ...prev,
        amount: bill.dueAmount.toString(),
      }));
      setErrors({});
    }
  }, [bill, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    // Amount validation
    const amount = parseFloat(paymentData.amount);
    if (!paymentData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = "Please enter a valid amount";
    } else if (amount > bill.dueAmount) {
      newErrors.amount = `Amount cannot exceed ₹${bill.dueAmount}`;
    }

    // Card validation (only if payment method is Card)
    if (paymentData.paymentMethod === "Card") {
      if (!paymentData.cardNumber || !/^\d{16}$/.test(paymentData.cardNumber.replace(/\s/g, ""))) {
        newErrors.cardNumber = "Please enter a valid 16-digit card number";
      }

      if (!paymentData.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentData.expiryDate)) {
        newErrors.expiryDate = "Please enter expiry date in MM/YY format";
      } else {
        const [month, year] = paymentData.expiryDate.split("/");
        const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
        if (expiry < new Date()) {
          newErrors.expiryDate = "Card has expired";
        }
      }

      if (!paymentData.cvv || !/^\d{3,4}$/.test(paymentData.cvv)) {
        newErrors.cvv = "Please enter a valid CVV (3-4 digits)";
      }

      if (!paymentData.cardholderName || paymentData.cardholderName.trim().length < 2) {
        newErrors.cardholderName = "Please enter the cardholder name";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (field, value) => {
    if (field === "cardNumber") {
      value = formatCardNumber(value);
    } else if (field === "expiryDate") {
      value = formatExpiryDate(value);
    }

    setPaymentData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate Stripe payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Fake success - in real Stripe, this would be handled by Stripe Elements
      const transactionId = `stripe_fake_${Date.now()}`;

      await onSubmit({
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        transactionId,
        notes: paymentData.notes || `Payment via ${paymentData.paymentMethod}`,
      });

      toast.success("Payment processed successfully!");
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!bill) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCardIcon className="w-5 h-5" />
            Pay Bill - {new Date(bill.billMonth + "-01").toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            })}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <Label htmlFor="amount">Payment Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={bill.dueAmount}
              value={paymentData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              className={errors.amount ? "border-red-500" : ""}
            />
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
            <p className="text-sm text-gray-500 mt-1">
              Due: ₹{bill.dueAmount} | Max: ₹{bill.dueAmount}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={paymentData.paymentMethod}
              onValueChange={(value) => handleInputChange("paymentMethod", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Card">Credit/Debit Card</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="BankTransfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Card Details (only show for Card payment) */}
          {paymentData.paymentMethod === "Card" && (
            <>
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={paymentData.cardNumber}
                  onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                  maxLength="19"
                  className={errors.cardNumber ? "border-red-500" : ""}
                />
                {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={paymentData.expiryDate}
                    onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                    maxLength="5"
                    className={errors.expiryDate ? "border-red-500" : ""}
                  />
                  {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                </div>

                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="password"
                    placeholder="123"
                    value={paymentData.cvv}
                    onChange={(e) => handleInputChange("cvv", e.target.value)}
                    maxLength="4"
                    className={errors.cvv ? "border-red-500" : ""}
                  />
                  {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  placeholder="John Doe"
                  value={paymentData.cardholderName}
                  onChange={(e) => handleInputChange("cardholderName", e.target.value)}
                  className={errors.cardholderName ? "border-red-500" : ""}
                />
                {errors.cardholderName && <p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>}
              </div>
            </>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Payment notes..."
              value={paymentData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
            />
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <LockClosedIcon className="w-4 h-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isPending || isProcessing}
          >
            {isProcessing ? "Processing Payment..." : `Pay ₹${paymentData.amount || "0"}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;