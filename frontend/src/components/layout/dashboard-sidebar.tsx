"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Panorama", href: "/dashboard", icon: "dashboard" },
  { name: "Mis Temas", href: "/dashboard/topics/following", icon: "bookmarks" },
  { name: "Temas", href: "/dashboard/topics", icon: "category" },
  { name: "Legisladores", href: "/dashboard/politicians", icon: "library_books" },
  { name: "Ejecutivo Nacional", href: "/dashboard/executive", icon: "account_balance" },
  { name: "Análisis", href: "/dashboard/analytics", icon: "bar_chart" },
  { name: "Hoy en el Congreso", href: "/dashboard/congress", icon: "today" },
  { name: "Ranking", href: "/dashboard/ranking", icon: "monitoring" },
  { name: "Comparador", href: "/dashboard/compare", icon: "forum" },
];

const bottomNavigation = [
  { name: "Alertas", href: "/dashboard/alerts", icon: "notifications" },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass-sidebar w-64 h-screen fixed left-0 top-0 flex flex-col z-50">
      <div className="p-8 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2 mb-10">
          <div className="size-6 text-black opacity-80">
            <svg
              className="w-full h-full"
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-lg font-medium tracking-tight text-black opacity-90 font-serif">
            Alethia
          </h2>
        </Link>
      </div>
      <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/dashboard/topics" &&
              pathname.startsWith(item.href)) ||
            (item.href === "/dashboard/topics" &&
              (pathname === "/dashboard/topics" ||
                (pathname.startsWith("/dashboard/topics/") &&
                  !pathname.startsWith("/dashboard/topics/following"))));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all",
                isActive
                  ? "text-black bg-white/50 rounded-xl shadow-sm border border-black/5"
                  : "text-gray-500 hover:text-black hover:bg-white/30"
              )}
            >
              <span className="material-symbols-outlined text-[20px]">
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 pb-2 border-t border-black/5 pt-2">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all",
                isActive
                  ? "text-black bg-white/50 shadow-sm border border-black/5"
                  : "text-gray-500 hover:text-black hover:bg-white/30"
              )}
            >
              <span className="material-symbols-outlined text-[20px]">
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </div>
      <div className="p-6 border-t border-black/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
            <img
              alt="User"
              className="w-full h-full object-cover opacity-80 mix-blend-multiply"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAK8CzpHAgXxgD4Dhbx3MBp4SmMOjo627eYbHl8wA0ayfWp3F527XM5vlxOS5vDuD-aFXbk3Wx0Ym4c8L7cTtqHL2ohVgV_tyW-HQOQTtfy7fktQmLB8Yp2WK2YFTRAZaDmYwwW4EZnrUncbRZUJTggtZp5FwNfoEoTCp3x360nm_Wjcj9tMVOPi96N9ER5V1U3Ja534WDepAnUQ4U4v4jyBbTs0FoUOxv55t-iOsWY9d9_-8K3_Ah0GVo2vncHBNvl7t1DrQquTdo"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-700">
              Cuenta Ciudadana
            </span>
            <span className="text-[10px] text-gray-400">Ver perfil</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
