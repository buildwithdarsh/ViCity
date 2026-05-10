import { buildPageMetadata } from "@/lib/seo";
import BottomNav from "../components/BottomNav";

export const metadata = buildPageMetadata({
  title: "My Account | Manage Stays, Profile, and Alerts",
  description: "Manage your ViCity account details, bookings, notifications, and reviews in one secure dashboard.",
  path: "/account",
  index: false,
});

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
