import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex font-display text-pure-black overflow-hidden bg-warm-white">
      <div className="ambient-light absolute top-[-10%] left-[-5%] w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(230,225,215,0.5)_0%,rgba(253,252,248,0)_70%)] blur-[80px] pointer-events-none -z-[1]" />
      <div className="ambient-light absolute bottom-[-20%] right-[-10%] w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(210,215,225,0.4)_0%,rgba(253,252,248,0)_70%)] blur-[100px] pointer-events-none -z-[1]" />
      <DashboardSidebar />
      <main className="ml-64 flex-1 h-screen overflow-y-auto thin-scrollbar p-8 lg:p-12">
        {children}
      </main>
    </div>
  );
}
