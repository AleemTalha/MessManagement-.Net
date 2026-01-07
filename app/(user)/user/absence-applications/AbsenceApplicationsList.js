"use client";
import { useState } from "react";
import { useUserAbsenceApplications, useSubmitAbsenceApplication } from "@/utils/useAbsenceApplications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, PlusIcon } from "@heroicons/react/24/solid";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const SubmitApplicationModal = ({ isOpen, onClose, onSubmit, isPending }) => {
  const [selectedDate, setSelectedDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }
    onSubmit({ date: selectedDate });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Absence Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Absence Date</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const AbsenceApplicationsList = () => {
  const { data, isLoading, isError, error, refetch } = useUserAbsenceApplications();
  const submitApplication = useSubmitAbsenceApplication();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmitApplication = async (applicationData) => {
    try {
      await submitApplication.mutateAsync(applicationData);
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
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
      <div className="flex justify-end">
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Submit Absence Application
        </Button>
      </div>

      {data?.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-600">Submit your first absence application to get started.</p>
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
                      <p className="font-medium">
                        {new Date(application.date).toLocaleDateString()} - {application.type || "Absence"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Submitted on {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(application.status)}
                    {application.reviewedAt && (
                      <p className="text-sm text-gray-600 mt-1">
                        Reviewed on {new Date(application.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                {application.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">{application.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SubmitApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitApplication}
        isPending={submitApplication.isPending}
      />
    </div>
  );
};

export default AbsenceApplicationsList;