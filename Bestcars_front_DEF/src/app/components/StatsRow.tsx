import { type LucideProps } from 'lucide-react';
import { type ComponentType } from 'react';

type LucideIcon = ComponentType<LucideProps>;

interface StatItemProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

interface StatsRowProps {
  stats: StatItemProps[];
}

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="p-5 rounded-2xl bg-white/[.02] border border-white/[.06] hover:bg-white/[.03] hover:border-white/[.08] transition-all duration-200 group"
        >
          <div className="w-11 h-11 rounded-xl grid place-items-center border border-white/[0.08] bg-white/[.03] mb-3 group-hover:bg-white/[.05] transition-colors">
            <stat.icon className="w-4 h-4 text-white/70" />
          </div>
          <div className="text-white/50 font-medium text-xs mb-1.5">{stat.label}</div>
          <div className="font-black text-lg text-white">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}