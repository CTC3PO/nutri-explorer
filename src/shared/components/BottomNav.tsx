"use client";

import Link from 'next/link';
import { Camera, Search, SlidersHorizontal, LayoutDashboard } from 'lucide-react';
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
        isActive ? "text-brand-500 scale-110" : "text-slate-400 opacity-60 hover:opacity-100"
      )}
    >
      <div className={cn(
        "p-1.5 rounded-xl transition-all",
        isActive ? "bg-brand-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : ""
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
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 glass z-50 pb-safe">
      <div className="flex h-full max-w-md mx-auto relative px-4">
        <NavItem href="/" icon={<Camera size={22} />} label="Scan" />
        <NavItem href="/explore" icon={<Search size={22} />} label="Explore" />
        <NavItem href="/simulate" icon={<SlidersHorizontal size={22} />} label="Simulate" />
        <NavItem href="/policy" icon={<LayoutDashboard size={22} />} label="Policy" />
      </div>
    </nav>
  );
}
