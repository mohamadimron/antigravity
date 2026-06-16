import React from "react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import DashboardLayoutShell from "@/app/components/DashboardLayoutShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Route fallback guard if middleware is bypassed
  if (!session) {
    redirect("/");
  }

  return (
    <DashboardLayoutShell user={session}>
      {children}
    </DashboardLayoutShell>
  );
}
