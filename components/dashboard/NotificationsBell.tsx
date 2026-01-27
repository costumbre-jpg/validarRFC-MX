"use client";
 
 import { useEffect, useState } from "react";
 import { createClient } from "@/lib/supabase/client";
 
 type Notification = {
   id: string;
   title: string;
   body: string;
   type: string | null;
   read: boolean | null;
   created_at: string;
 };
 
 export default function NotificationsBell() {
   const [open, setOpen] = useState(false);
   const [items, setItems] = useState<Notification[]>([]);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     const loadNotifications = async () => {
       const supabase = createClient();
       const { data } = await supabase
         .from("notifications")
         .select("id,title,body,type,read,created_at")
         .order("created_at", { ascending: false })
         .limit(10);
 
       setItems(data || []);
       setLoading(false);
     };
 
     loadNotifications();
   }, []);
 
   const unreadCount = items.filter((item) => !item.read).length;
 
   const markAllRead = async () => {
     const supabase = createClient();
     await supabase
       .from("notifications")
       .update({ read: true })
       .eq("read", false);
 
     setItems((prev) => prev.map((item) => ({ ...item, read: true })));
   };
 
   return (
     <div className="relative">
       <button
         type="button"
         className="relative inline-flex items-center justify-center h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-700 hover:text-brand-primary hover:border-brand-primary transition-colors"
         onClick={() => setOpen((prev) => !prev)}
         aria-label="Notificaciones"
       >
         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0h6z" />
         </svg>
         {unreadCount > 0 && (
           <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1.5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
             {unreadCount}
           </span>
         )}
       </button>
 
       {open && (
         <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-lg border border-gray-200 bg-white shadow-lg z-50">
           <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
             <p className="text-sm font-semibold text-gray-900">Notificaciones</p>
             <button
               onClick={markAllRead}
               className="text-xs text-gray-500 hover:text-gray-700"
               type="button"
             >
               Marcar todo
             </button>
           </div>
           <div className="max-h-72 overflow-y-auto">
             {loading && (
               <div className="p-4 text-xs text-gray-500">Cargando...</div>
             )}
             {!loading && items.length === 0 && (
               <div className="p-4 text-xs text-gray-500">Sin notificaciones</div>
             )}
             {items.map((item) => (
               <div
                 key={item.id}
                 className={`px-4 py-3 border-b border-gray-100 ${item.read ? "bg-white" : "bg-gray-50"}`}
               >
                 <p className="text-xs font-semibold text-gray-900">{item.title}</p>
                 <p className="text-xs text-gray-600 mt-1">{item.body}</p>
               </div>
             ))}
           </div>
         </div>
       )}
     </div>
   );
 }
