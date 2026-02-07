"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  School, 
  UserCog, 
  ClipboardList 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthContext"; 

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth(); 

  const menu = [
    { 
      icon: LayoutDashboard, 
      label: "Dashboard", 
      href: "/dashboard" 
    },
    { 
      icon: School, 
      label: "Escolas", 
      href: "/dashboard/schools",
      roles: ["SUPER_ADMIN"] // Alinhado com o teu UserRole no Context
    },
    { 
      icon: GraduationCap, 
      label: "Cursos", 
      href: "/dashboard/courses" 
    },
    { 
      icon: Users, 
      label: "Estudantes", 
      href: "/dashboard/studants"
    },
    { 
      icon: ClipboardList, 
      label: "Inscrições", 
      href: "/dashboard/registrations" 
    },
    { 
      icon: UserCog, 
      label: "Usuários", 
      href: "/dashboard/users",
      roles: ["SUPER_ADMIN", "ADMIN"] // Apenas gestores vêem usuários
    },
  ];

  // Filtro de segurança para renderização do menu
  const filteredMenu = menu.filter((item) => {
    if (!item.roles) return true; 
    // Verifica se a role do usuário (ex: "SUPER_ADMIN") está no array permitido
    return item.roles.includes(user?.role as any); 
  });

  return (
    <aside className="w-72 h-screen border-r bg-white flex flex-col sticky top-0">
      <div className="p-8 border-b">
        <h1 className="font-black text-2xl tracking-tighter text-blue-600">
          EnrollMaster
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">
          SaaS Management
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2 mt-4">
        {filteredMenu.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
              )}
            >
              <item.icon 
                size={22} 
                className={cn(
                  "transition-colors",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"
                )} 
              />
              <span className={cn(
                "text-sm font-bold tracking-tight",
                isActive ? "text-white" : "text-slate-700"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Perfil do Usuário Logado */}
      <div className="p-4 border-t bg-slate-50/50">
        <div className="flex items-center gap-3 px-2 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shrink-0">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-black text-slate-900 truncate leading-none mb-1">
              {user?.name || "Usuário"}
            </p>
            <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md">
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}