"use client";

import { useRouter } from "next/navigation";
import AuthPageLayout from "../../components/auth/AuthPageLayout";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <AuthPageLayout
      image="/images/sunset-orange-gradient.webp"
      imageAlt="Sunset at ViCity"
      tagline="Don't worry"
      heading="Reset Your Password"
      description="We'll help you get back into your account in just a few steps."
    >
      <ForgotPasswordForm
        onBackToLogin={() => router.push("/auth/login")}
      />
    </AuthPageLayout>
  );
}
