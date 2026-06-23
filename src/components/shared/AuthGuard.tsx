"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/constants";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(ROUTES.LOGIN);
      } else {
        // RBAC Routing Protection
        // Non-admins shouldn't access /employees
        if (!isAdmin && pathname.startsWith(ROUTES.EMPLOYEES)) {
          router.replace(ROUTES.DASHBOARD);
        } else {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setIsChecking(false);
        }
      }
    }
  }, [isAuthenticated, isLoading, router, isAdmin, pathname]);

  if (isLoading || isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
