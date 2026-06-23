"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of employee and leave request statistics"
      />
      <DashboardGrid />
    </>
  );
}
