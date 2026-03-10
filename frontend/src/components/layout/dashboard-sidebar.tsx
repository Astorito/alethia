"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Estructura de navegación basada en el mapa de la plataforma
// 7 dominios principales: Panorama, Legisladores, Ejecutivo, Temas, Análisis, Ranking, Alertas

const mainNavigation = [
  { 
    name: "Panorama", 
    href: "/dashboard", 
    icon: "dashboard",
    description: "Vista general"
  },
  { 
    name: "Legisladores", 
    href: "/dashboard/politicians", 
    icon: "library_books",
    description: "Perfiles y seguimiento"
  },
  { 
    name: "Ejecutivo Nacional", 
    href: "/dashboard/executive", 
    icon: "account_balance",
    description: "Poder Ejecutivo"
  },
  { 
    name: "Temas", 
    href: "/dashboard/topics", 
    icon: "category",
    description: "Foros y debates"
  },
];

const analyticsNavigation = [
  { 
    name: "Análisis", 
    href: "/dashboard/analytics", 
    icon: "bar_chart",
    description: "Visualizaciones"
  },
  { 
    name: "Ranking", 
    href: "/dashboard/ranking", 
    icon: "monitoring",
    description: "Métricas y posiciones"
  },
];

const dailyNavigation = [
  { 
    name: "Hoy en el Congreso", 
    href: "/dashboard/congress", 
    icon: "today",
    description: "Actividad del día"
  },
];

const toolsNavigation = [
  { 
    name: "Comparador", 
    href: "/dashboard/compare", 
    icon: "forum",
    description: "Comparar legisladores"
  },
  { 
    name: "Mis Temas", 
    href: "/dashboard/topics/following", 
    icon: "bookmarks",
    description: "Seguimiento personal"
  },
];

const alertsNavigation = [
  { 
    name: "Alertas", 
    href: "/dashboard/alerts", 
    icon: "notifications",
    description: "Notificaciones"
  },
];

function NavItem({ 
  item, 
  pathname,
  isNested = false 
}: { 
  item: { name: string; href: string; icon: string; description?: string }; 
  pathname: string;
  isNested?: boolean;
}) {
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
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all group",
        isActive
          ? "text-black bg-white/50 rounded-xl shadow-sm border border-black/5"
          : "text-gray-500 hover:text-black hover:bg-white/30",
        isNested && "ml-2"
      )}
    >
      <span className={cn(
        "material-symbols-outlined text-[20px]",
        isActive ? "text-black" : "text-gray-400 group-hover:text-gray-600"
      )}>
        {item.icon}
      </span>
      <div className="flex flex-col">
        <span>{item.name}</span>
        {item.description && (
          <span className="text-[10px] text-gray-400 font-normal leading-tight">
            {item.description}
          </span>
        )}
      </div>
    </Link>
  );
}

function NavSection({ 
  title, 
  children 
}: { 
  title?: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      {title && (
        <div className="px-3 mb-2">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            {title}
          </span>
        </div>
      )}
      <div className="space-y-0.5">
        {children}
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass-sidebar w-64 h-screen fixed left-0 top-0 flex flex-col z-50">
      <div className="p-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2 mb-8">
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

      <nav className="flex-1 px-3 overflow-y-auto thin-scrollbar">
        {/* Dominios principales del mapa */}
        <NavSection>
          {mainNavigation.map((item) => (
            <NavItem key={item.name} item={item} pathname={pathname} />
          ))}
        </NavSection>

        {/* Análisis y métricas */}
        <NavSection title="Análisis">
          {analyticsNavigation.map((item) => (
            <NavItem key={item.name} item={item} pathname={pathname} />
          ))}
        </NavSection>

        {/* Actividad diaria */}
        <NavSection title="Hoy">
          {dailyNavigation.map((item) => (
            <NavItem key={item.name} item={item} pathname={pathname} />
          ))}
        </NavSection>

        {/* Herramientas personales */}
        <NavSection title="Herramientas">
          {toolsNavigation.map((item) => (
            <NavItem key={item.name} item={item} pathname={pathname} />
          ))}
        </NavSection>
      </nav>

      {/* Alertas - siempre visible abajo */}
      <div className="px-3 pb-4 border-t border-black/5 pt-4">
        <NavSection>
          {alertsNavigation.map((item) => (
            <NavItem key={item.name} item={item} pathname={pathname} />
          ))}
        </NavSection>
      </div>

      {/* Perfil de usuario */}
      <div className="p-4 border-t border-black/5">
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
