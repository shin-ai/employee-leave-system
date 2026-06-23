"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthStorageService } from "@/services/auth-storage";
import { ROUTES } from "@/constants";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (AuthStorageService.isAuthenticated()) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [router]);

  return <LoginForm />;
}
