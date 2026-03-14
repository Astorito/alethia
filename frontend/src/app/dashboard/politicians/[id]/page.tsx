"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, MapPin, Calendar, Mail, Phone, ExternalLink, Users, FileText, Building2 } from "lucide-react";

interface Politician {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  province: string;
  photo_url: string;
  bio: string;
  bloc: string;
  chamber: string;
  external_id: string;
  consistency_score: number;
  activity_score: number;
}

interface Commission {
  id: number;
  name: string;
  role: string;
}

interface Project {
  id: number;
  expediente: string;
  date: string;
  extract: string;
  url: string;
}

interface Staff {
  id: number;
  full_name: string;
  category: string;
}

export default function PoliticianProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [politician, setPolitician] = useState<Politician | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"proyectos" | "comisiones" | "personal">("proyectos");

  useEffect(() => {
    if (!id) return;
    loadAll();
  }, [id]);

  async function loadAll() {
    setLoading(true);
    try {
      // Politician
      const { data: pol } = await supabase
        .from("politicians")
        .select("*")
        .eq("id", id)
        .single();
      setPolitician(pol);

      if (pol?.chamber === "senate") {
        // Senadores: tablas propias
        const [{ data: com }, { data: proj }, { data: st }] = await Promise.all([
          supabase.from("senator_commissions").select("*").eq("politician_id", id).order("name"),
          supabase.from("senator_projects").select("*").eq("politician_id", id).order("date", { ascending: false }),
          supabase.from("senator_staff").select("*").eq("politician_id", id).order("full_name"),
        ]);
        setCommissions(com || []);
        setProjects(proj || []);
        setStaff(st || []);
      } else {
        // Diputados: committee_memberships + bills
        const { data: mem } = await supabase
          .from("committee_memberships")
          .select("committee_id, role, committees(name)")
          .eq("politician_id", id);
        setCommissions(
          (mem || []).map((m: any, i: number) => ({
            id: i,
            name: m.committees?.name || "",
            role: m.role || "VOCAL",
          }))
        );

        const { data: billAuth } = await supabase
          .from("bill_authors")
          .select("bill_id, bills(external_id, title, presented_at, source_url)")
          .eq("politician_id", id)
          .order("bill_id", { ascending: false })
          .limit(50);
        setProjects(
          (billAuth || []).map((b: any, i: number) => ({
            id: i,
            expediente: b.bills?.external_id || "",
            date: b.bills?.presented_at || "",
            extract: b.bills?.title || "",
            url: b.bills?.source_url || "",
          }))
        );
        setStaff([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800" />
      </div>
    );
  }

  if (!politician) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400">Legislador no encontrado.</p>
      </div>
    );
  }

  const chamberLabel = politician.chamber === "senate" ? "Senado de la Nación" : "Cámara de Diputados";
  const initials = `${politician.first_name?.[0] || ""}${politician.last_name?.[0] || ""}`.toUpperCase();

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {/* Back button */}
      <div className="px-6 pt-5 pb-0">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-5"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a legisladores
        </button>
      </div>

      {/* Hero card */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
          {/* Top bar with chamber color */}
          <div className={`h-1.5 w-full ${politician.chamber === "senate" ? "bg-indigo-500" : "bg-blue-500"}`} />

          <div className="p-6">
            <div className="flex items-start gap-5">
              {/* Photo */}
              <div className="flex-shrink-0">
                {politician.photo_url ? (
                  <img
                    src={politician.photo_url}
                    alt={politician.full_name}
                    className="w-24 h-24 rounded-xl object-cover shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-400">
                    {initials}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                      {politician.full_name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {/* Bloc badge */}
                      {politician.bloc && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-900 text-white">
                          {politician.bloc}
                        </span>
                      )}
                      {/* Province */}
                      {politician.province && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          {politician.province}
                        </span>
                      )}
                      {/* Chamber */}
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        politician.chamber === "senate"
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-blue-50 text-blue-700"
                      }`}>
                        <Building2 className="h-3 w-3" />
                        {chamberLabel}
                      </span>
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="flex gap-4 flex-shrink-0">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {politician.consistency_score != null
                          ? Math.round(politician.consistency_score)
                          : "—"}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">Coherencia</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {politician.activity_score != null
                          ? Math.round(politician.activity_score)
                          : "—"}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">Actividad</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {projects.length}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">Proyectos</div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {politician.bio && (
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {politician.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-4">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {[
            { key: "proyectos", label: "Proyectos", icon: FileText, count: projects.length },
            { key: "comisiones", label: "Comisiones", icon: Building2, count: commissions.length },
            ...(politician.chamber === "senate"
              ? [{ key: "personal", label: "Personal", icon: Users, count: staff.length }]
              : []),
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                activeTab === tab.key ? "bg-gray-100 text-gray-600" : "bg-gray-200 text-gray-500"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-6 pb-8">

        {/* Proyectos */}
        {activeTab === "proyectos" && (
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
            {projects.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Sin proyectos registrados.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3 w-28">Expediente</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3 w-28">Fecha</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Extracto</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {p.expediente}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">{p.date}</td>
                      <td className="px-5 py-3 text-sm text-gray-700 leading-snug max-w-xl">
                        {p.extract}
                      </td>
                      <td className="px-3 py-3">
                        {p.url && (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-blue-500 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Comisiones */}
        {activeTab === "comisiones" && (
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
            {commissions.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Sin comisiones registradas.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Comisión</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3 w-40">Cargo</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-sm text-gray-800">{c.name}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {c.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Personal (senadores) */}
        {activeTab === "personal" && (
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
            {staff.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Sin personal registrado.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Nombre</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3 w-32">Categoría</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-sm text-gray-800">{s.full_name}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-mono font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {s.category}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
