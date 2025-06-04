// src/app/dashboard/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard/Dashboard";
import { adminAuth } from "@/firebaseAdmin";

export default async function DashboardPage() {
  // cookies()はPromise型なのでawaitが必須
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/");
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (decoded.email !== "ikejirisensei@test.com") {
      redirect("/");
    }
    // 先生だけ通す
    return <Dashboard />;
  } catch {
    redirect("/");
  }
}
