"use client";
import { useState } from "react";
import { useAdminAbsenceApplications, useReviewAbsenceApplication } from "@/utils/useAdminAbsenceApplications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-toastify";

const getStatusBadge = (status) => {
  switch (status) {
    case "Pending":
      return <Badge variant="secondary">Pending</Badge>;
    case "Approved":
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
    case "Rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const ReviewModal = ({ isOpen, onClose, application, onSubmit, isPending }) => {
  const [status, setStatus] = useState("Approved");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ status, notes });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review {application?.type || "Absence"} Application</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <strong>User:</strong> {application?.userName}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Date:</strong> {application ? new Date(application.date).toLocaleDateString() : ""}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Type:</strong> {application?.type || "Absence"}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="status">Decision</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Approved">Approve</SelectItem>
                <SelectItem value="Rejected">Reject</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes for the user..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const AbsenceApplicationsList = () => {
  const { data, isLoading, isError, error, refetch } = useAdminAbsenceApplications();
  const reviewApplication = useReviewAbsenceApplication();
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReviewApplication = (application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      await reviewApplication.mutateAsync({
        id: selectedApplication.id,
        ...reviewData,
      });
      setIsModalOpen(false);
      setSelectedApplication(null);
      refetch();
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Error loading applications: {error.message}</p>
          <Button onClick={refetch} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {data?.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications</h3>
            <p className="text-gray-600">No absence applications to review at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data?.map((application) => (
            <Card key={application.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{application.userName}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(application.date).toLocaleDateString()} - {application.type || "Absence"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Submitted on {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(application.status)}
                    {application.status === "Pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReviewApplication(application)}
                        >
                          <CheckIcon className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                {application.reviewedAt && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>Reviewed by:</strong> {application.reviewedBy} on{" "}
                      {new Date(application.reviewedAt).toLocaleDateString()}
                    </p>
                    {application.notes && (
                      <p className="text-sm text-gray-700 mt-1">
                        <strong>Notes:</strong> {application.notes}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        application={selectedApplication}
        onSubmit={handleSubmitReview}
        isPending={reviewApplication.isPending}
      />
    </div>
  );
};

export default AbsenceApplicationsList;