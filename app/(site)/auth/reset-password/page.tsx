"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();

  useEffect(() => {
    // The reset password flow is now handled entirely through the forgot-password page
    // (phone → OTP → set new password). Redirect there.
    router.replace("/auth/forgot-password");
  }, [router]);

  return null;
}
