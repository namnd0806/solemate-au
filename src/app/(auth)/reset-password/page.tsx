"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const ResetPasswordForm = dynamic(
  () => import("@/components/auth/ResetPasswordForm"),
  {
    loading: () => <div className="p-4">Loading...</div>,
    ssr: false,
  }
);

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
