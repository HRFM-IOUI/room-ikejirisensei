// src/app/dashboard/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase";
import { useAdminClaims } from "@/hooks/useAdminClaims";
import Dashboard from "@/components/dashboard/Dashboard"; // ←追加！

export default function DashboardPage() {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, claimsLoading] = useAdminClaims();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !claimsLoading) {
      if (!user) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/community");
      }
    }
  }, [user, loading, isAdmin, claimsLoading, router]);

  if (loading || claimsLoading) return <div>認証確認中...</div>;
  if (!user || !isAdmin) return null;

  return <Dashboard />;
}
