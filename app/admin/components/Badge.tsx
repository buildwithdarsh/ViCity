const colors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  checked_in: "bg-green-100 text-green-800",
  checked_out: "bg-zinc-100 text-zinc-800",
  cancelled: "bg-red-100 text-red-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-purple-100 text-purple-800",
  active: "bg-green-100 text-green-800",
  inactive: "bg-zinc-100 text-zinc-700",
  blocked: "bg-red-100 text-red-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  hidden: "bg-zinc-100 text-zinc-600",
  sent: "bg-green-100 text-green-800",
  available: "bg-green-100 text-green-800",
  maintenance: "bg-orange-100 text-orange-800",
  clean: "bg-green-100 text-green-800",
  dirty: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  inspected: "bg-teal-100 text-teal-800",
  expired: "bg-zinc-100 text-zinc-600",
  user: "bg-blue-100 text-blue-800",
  admin: "bg-purple-100 text-purple-800",
  super_admin: "bg-indigo-100 text-indigo-800",
  guest: "bg-zinc-100 text-zinc-600",
  percentage: "bg-blue-100 text-blue-800",
  flat: "bg-zinc-100 text-zinc-700",
};

export default function Badge({ value }: { value: string }) {
  const cls = colors[value] || "bg-zinc-100 text-zinc-700";
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {value.replace(/_/g, " ")}
    </span>
  );
}
