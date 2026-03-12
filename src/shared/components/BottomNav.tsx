"use client";

import Link from 'next/link';
import { Camera, Search, SlidersHorizontal, LayoutDashboard, Clock } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

function NavItem({ href, icon, label }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link 
      href={href}
      className={cn(
        "flex-1 flex flex-col items-center justify-center gap-1 transition-all relative",
        isActive ? "text-brand-500" : "text-slate-400 opacity-60 hover:opacity-100"
      )}
    >
      <div className={cn(
        "p-1.5 rounded-xl transition-all",
        isActive ? "bg-brand-500/10" : ""
      )}>
        {icon}
      </div>
      <span className="text-[11px] font-medium leading-none">{label}</span>
      {isActive && (
        <div className="absolute bottom-1 w-1 h-1 bg-brand-500 rounded-full" />
      )}
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const isScanActive = pathname === '/';

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 glass z-50 pb-safe">
      <div className="flex h-full max-w-md mx-auto relative items-center px-2">
        <NavItem href="/explore" icon={<Search size={20} />} label="Explore" />
        <NavItem href="/simulate" icon={<SlidersHorizontal size={20} />} label="Simulate" />

        {/* FAB-style center Scan button */}
        <Link
          href="/"
          className="flex flex-col items-center justify-center gap-1 flex-1 relative group"
        >
          <div className={cn(
            "flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg -translate-y-4 transition-all active:scale-95",
            isScanActive 
              ? "bg-brand-500 shadow-brand-500/40 scale-105" 
              : "bg-slate-900 shadow-slate-900/30 group-hover:bg-brand-500 group-hover:shadow-brand-500/30"
          )}>
            <Camera size={24} className="text-white" />
          </div>
          <span className={cn(
            "text-[11px] font-medium leading-none -mt-3",
            isScanActive ? "text-brand-500" : "text-slate-400"
          )}>Scan</span>
        </Link>

        <NavItem href="/policy" icon={<LayoutDashboard size={20} />} label="Policy" />
        <NavItem href="/history" icon={<Clock size={20} />} label="History" />
      </div>
    </nav>
  );
}
