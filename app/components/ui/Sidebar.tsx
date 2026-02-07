"use client";

import Link from "next/link";
import { LayoutDashboard, GraduationCap, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const menu = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: LayoutDashboard, label: "Escolas", href: "/dashboard/schools" },
    { icon: GraduationCap, label: "Cursos", href: "/dashboard/courses" },
    {icon:Users,label:"Estudantes",href:"/dashboard/studants"},
    { icon: Users, label: "Inscrições", href: "/dashboard/registrations" },
    { icon: Users, label: "Usuarios", href: "/dashboard/users" },
  ];

  return (
    <aside className="w-64 h-full border-r bg-white p-6">
      <h1 className="font-bold text-xl mb-8">Secretaria</h1>

      <nav className="flex flex-col gap-2">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md group"
            )}
          >
            <item.icon size={18} className="text-gray-600" />
            <span className="group-hover:font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
