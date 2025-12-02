// src/app/(dashboard)/admin/layout.tsx
import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import AdminHeader from "@/components/layout/AdminHeader";

export const metadata = {
  title: "Admin - LMS",
};

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex grow flex-col lg:ps-75">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
