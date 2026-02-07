"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";
import { Building2, Users, MapPin, Phone, ExternalLink } from "lucide-react";

type School = {
  id: string;
  name: string;
  location: string;
  contact: string;
  _count?: {
    students: number;
    users: number;
  };
};

export default function RegistrationsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchSchools = async () => {
    const token = user?.access_token || (typeof window !== "undefined" && JSON.parse(localStorage.getItem("user") || "{}").access_token);

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/schools", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      setSchools(data);
    } catch (error) {
      toast.error("Erro ao carregar lista de instituições.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [user]);

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho Pro */}
      <div className="flex justify-between items-end border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Escolas Parceiras</h1>
          <p className="text-muted-foreground">Gerencie as instituições integradas à plataforma SaaS.</p>
        </div>
        <Link href="/dashboard/schools/new">
          <Button className="gap-2">
            <Building2 className="w-4 h-4" /> Registrar Nova Escola
          </Button>
        </Link>
      </div>

      {/* Grid de Resumo Rápido (Opcional, mas dá um toque SaaS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-xl bg-card">
          <p className="text-sm font-medium text-muted-foreground">Total de Escolas</p>
          <p className="text-2xl font-bold">{schools.length}</p>
        </div>
        <div className="p-4 border rounded-xl bg-card">
          <p className="text-sm font-medium text-muted-foreground">Alunos na Plataforma</p>
          <p className="text-2xl font-bold">
            {schools.reduce((acc, s) => acc + (s._count?.students || 0), 0)}
          </p>
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[300px]">Instituição</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead className="text-center">Staff / Alunos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground animate-pulse">
                  Sincronizando dados com o servidor...
                </TableCell>
              </TableRow>
            ) : schools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20">
                  <div className="flex flex-col items-center gap-2">
                    <Building2 className="w-10 h-10 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Nenhuma escola cadastrada.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              schools.map((school) => (
                <TableRow key={school.id} className="hover:bg-muted/5 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{school.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono uppercase">ID: {school.id.split('-')[0]}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="w-3 h-3 text-primary" /> {school.location || "Província N/D"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="w-3 h-3 text-primary" /> {school.contact || "Sem contacto"}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Badge variant="secondary" className="gap-1 font-normal">
                        <Users className="w-3 h-3" /> {school._count?.users || 0} Admins
                      </Badge>
                      <Badge variant="outline" className="gap-1 font-normal border-primary/30 text-primary">
                        {school._count?.students || 0} Alunos
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/schools/${school.id}`}>
                   <Button variant="ghost" size="sm" className="gap-2 hover:text-primary">
                   Gerenciar <ExternalLink className="w-3 h-3" />
                   </Button>
                   </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}