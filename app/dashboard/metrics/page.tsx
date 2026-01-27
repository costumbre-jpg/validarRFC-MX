"use client";
 
 export const dynamic = "force-dynamic";
 
 import { useEffect, useState } from "react";
 import { useRouter } from "next/navigation";
 import { createClient } from "@/lib/supabase/client";
 
 type Metrics = {
   usersCount: number;
   validationsCount: number;
   validationsMonthCount: number;
   totalApiCallsThisMonth: number;
   activeSubscriptions: number;
 };
 
 export default function MetricsPage() {
   const router = useRouter();
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [metrics, setMetrics] = useState<Metrics | null>(null);
 
   useEffect(() => {
     const loadMetrics = async () => {
       const supabase = createClient();
       const { data: { session } } = await supabase.auth.getSession();
 
       if (!session) {
         router.replace("/auth/login");
         return;
       }
 
       try {
         const res = await fetch("/api/admin/metrics", {
           headers: {
             Authorization: `Bearer ${session.access_token}`,
           },
         });
 
         if (!res.ok) {
           const data = await res.json();
           setError(data?.error || "No autorizado");
           setLoading(false);
           return;
         }
 
         const data = await res.json();
         setMetrics(data);
         setLoading(false);
       } catch (e: any) {
         setError("Error al cargar métricas");
         setLoading(false);
       }
     };
 
     loadMetrics();
   }, [router]);
 
   if (loading) {
     return (
       <div className="flex items-center justify-center py-8">
         <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>
       </div>
     );
   }
 
   if (error) {
     return (
       <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-sm text-gray-600">
         {error}
       </div>
     );
   }
 
   if (!metrics) {
     return null;
   }
 
   const cards = [
     { label: "Usuarios totales", value: metrics.usersCount },
     { label: "Validaciones totales", value: metrics.validationsCount },
     { label: "Validaciones este mes", value: metrics.validationsMonthCount },
     { label: "Llamadas API este mes", value: metrics.totalApiCallsThisMonth },
     { label: "Suscripciones activas", value: metrics.activeSubscriptions },
   ];
 
   return (
     <div className="space-y-4 max-md:space-y-3">
       <div>
         <div className="flex items-center gap-2 flex-wrap mb-3 max-md:mb-2">
           <span className="inline-flex items-center px-3 max-md:px-2.5 py-1.5 max-md:py-1 rounded-full text-xs max-md:text-[11px] font-semibold bg-brand-primary-10 text-brand-primary">
             Métricas
           </span>
         </div>
         <p className="text-xs max-md:text-[11px] text-gray-600">
           Panel interno con métricas generales.
         </p>
       </div>
 
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-md:gap-3">
         {cards.map((card) => (
           <div
             key={card.label}
             className="bg-white rounded-lg border border-gray-200 p-4 max-md:p-3 shadow-sm"
           >
             <p className="text-xs text-gray-500">{card.label}</p>
             <p className="text-2xl max-md:text-xl font-semibold text-gray-900 mt-2">
               {card.value.toLocaleString()}
             </p>
           </div>
         ))}
       </div>
     </div>
   );
 }
