import type React from "react"
import { DynamicAdminSidebar } from "@/components/dynamic-admin-sidebar"
import { AuthGuard } from "@/components/auth-guard"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <DynamicAdminSidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>
    </AuthGuard>
  )
}
