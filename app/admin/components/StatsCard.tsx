interface StatsCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
}

export default function StatsCard({ label, value, subtitle }: StatsCardProps) {
  return (
    <div className="border border-zinc-200 rounded p-5 bg-white">
      <p className="text-sm text-zinc-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-zinc-900">{value}</p>
      {subtitle && <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>}
    </div>
  );
}
