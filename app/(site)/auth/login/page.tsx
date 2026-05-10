"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import AuthPageLayout from "../../components/auth/AuthPageLayout";
import LoginForm from "../../components/auth/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) router.push("/account");
  }, [user, router]);

  return (
    <AuthPageLayout
      image="/images/living-room-sofa-landscape.webp"
      imageAlt="ViCity interior"
      tagline="Welcome to"
      heading="ViCity"
      description="Sign in to manage your bookings, view your stay details, and access exclusive offers."
    >
      <h1 className="text-2xl font-serif text-charcoal mb-1">Sign In</h1>
      <p className="text-zinc-400 text-sm mb-6">Welcome back to your account</p>
      <LoginForm
        onSuccess={() => router.push("/account")}
        onForgotPassword={() => router.push("/auth/forgot-password")}
        onSwitchToRegister={() => router.push("/auth/register")}
      />
    </AuthPageLayout>
  );
}
