"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import AuthPageLayout from "../../components/auth/AuthPageLayout";
import RegisterForm from "../../components/auth/RegisterForm";

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) router.push("/account");
  }, [user, router]);

  return (
    <AuthPageLayout
      image="/images/bedroom-brown-wide.webp"
      imageAlt="ViCity bedroom"
      tagline="Join us at"
      heading="ViCity"
      description="Create your account for a seamless booking experience and exclusive member benefits."
    >
      <h1 className="text-2xl font-serif text-charcoal mb-1">Create Account</h1>
      <p className="text-zinc-400 text-sm mb-6">Join us for a seamless experience</p>
      <RegisterForm
        onSuccess={() => router.push("/account")}
        onSwitchToLogin={() => router.push("/auth/login")}
      />
    </AuthPageLayout>
  );
}
