"use client";

import { AuthGuard } from "@/components/shared/AuthGuard";
import { AppLayout } from "@/components/shared/AppLayout";
import { PageTransition } from "@/components/shared/PageTransition";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AppLayout>
        <PageTransition>{children}</PageTransition>
      </AppLayout>
    </AuthGuard>
  );
}
