import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  prefix?: string;
  suffix?: string;
}

export function StatCard({ title, value, icon: Icon, trend, prefix, suffix }: Props) {
  const isPositive = trend?.startsWith("+");
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-diamond-muted text-sm">{title}</p>
        <div className="w-8 h-8 rounded-lg bg-diamond-gold/10 flex items-center justify-center">
          <Icon size={16} className="text-diamond-gold" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-white">
          {prefix}{typeof value === "number" ? value.toLocaleString("fr-CA") : value}{suffix}
        </p>
        {trend && (
          <span className={isPositive ? "badge-green" : "badge-red"}>{trend}</span>
        )}
      </div>
    </div>
  );
}
