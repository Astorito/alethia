"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Trophy,
  GitCompare,
  BarChart3,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Legisladores",
    href: "/politicians",
    icon: Users,
  },
  {
    name: "Ranking",
    href: "/ranking",
    icon: Trophy,
  },
  {
    name: "Comparador",
    href: "/compare",
    icon: GitCompare,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("flex flex-col h-full bg-alethia-primary", className)}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white">Alethia</h1>
        <p className="text-sm text-gray-300 mt-1">
          Inteligencia Política
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-alethia-highlight text-white"
                  : "text-gray-300 hover:bg-alethia-accent hover:text-white"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-alethia-accent">
        <div className="text-xs text-gray-400">
          Plataforma de transparencia legislativa
        </div>
      </div>
    </div>
  );
}