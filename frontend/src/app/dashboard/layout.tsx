import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex font-display text-pure-black overflow-hidden" style={{ background: "#EDECE8" }}>
      {/* Subtle ambient gradient top-left */}
      <div className="fixed top-[-10%] left-[-5%] w-[800px] h-[800px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(220,220,215,0.35) 0%, transparent 70%)", filter: "blur(80px)", zIndex: 0 }} />
      {/* Subtle ambient gradient bottom-right */}
      <div className="fixed bottom-[-20%] right-[-10%] w-[900px] h-[900px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(200,210,220,0.25) 0%, transparent 70%)", filter: "blur(100px)", zIndex: 0 }} />
      <DashboardSidebar />
      <main className="ml-64 flex-1 h-screen overflow-y-auto thin-scrollbar p-8 lg:p-12 relative z-10">
        {children}
      </main>
    </div>
  );
}
