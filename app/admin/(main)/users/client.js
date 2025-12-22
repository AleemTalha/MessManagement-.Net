"use client";

import { useState, useEffect, useCallback } from "react";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/utils/useUsers";
import { toast } from "react-toastify";
import UserModal from "./ui/UserModal";
import UserTable from "./ui/UserTable";

export default function UsersClient() {
  const [skip, setSkip] = useState(0);
  const [limit] = useState(10);
  const { data, isLoading, error, refetch } = useUsers(skip, limit);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const openAddModal = useCallback(() => {
    setEditingUser(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const handleOpenAddModal = () => openAddModal();
    window.addEventListener("openAddUserModal", handleOpenAddModal);
    return () => window.removeEventListener("openAddUserModal", handleOpenAddModal);
  }, [openAddModal]);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (userData) => {
    try {
      if (editingUser) {
        await updateUser.mutateAsync({ id: editingUser.id, data: userData });
        toast.success("User updated successfully!");
      } else {
        await createUser.mutateAsync(userData);
        toast.success("User created successfully!");
      }
      closeModal();
    } catch (error) {
      toast.error(error.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await deleteUser.mutateAsync(id);
      toast.success("User deleted successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  const handlePageChange = (newSkip) => {
    setSkip(newSkip);
  };

  return (
    <div className="space-y-6">
      <UserModal
        isOpen={isModalOpen}
        onClose={closeModal}
        user={editingUser}
        onSubmit={handleSubmit}
        isPending={createUser.isPending || updateUser.isPending}
      />

      <UserTable
        users={data?.users}
        total={data?.total || 0}
        skip={skip}
        limit={limit}
        isLoading={isLoading}
        onEdit={openEditModal}
        onDelete={handleDelete}
        isDeleting={deleteUser.isPending}
        error={error}
        onPageChange={handlePageChange}
        onRetry={refetch}
      />
    </div>
  );
}
