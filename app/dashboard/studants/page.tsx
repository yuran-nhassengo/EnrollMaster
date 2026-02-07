"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, UserPlus, Search, Loader2, Smartphone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import { Input } from "@/components/ui/input";

type Student = {
  id: string;
  name: string;
  whatsappNumber: string | null;
  status: "PRE_INSCRITO" | "ATIVO" | "INATIVO";
  createdAt: string;
  // Adicionamos as matrículas para saber o que ele está cursando
  enrollments: any[]; 
};

export default function ConfirmedStudentsPage() {
  const [data, setData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  const token = useMemo(() => {
    return user?.access_token || (typeof window !== "undefined" && JSON.parse(localStorage.getItem("user") || "{}").access_token);
  }, [user]);

  useEffect(() => {
    async function fetchStudents() {
      if (!token) return;

      try {
        setLoading(true);
        // Usamos a rota principal de estudantes
        const response = await fetch("http://localhost:3001/students", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error();
        const result = await response.json();
        
        // FILTRO CRÍTICO: Apenas estudantes ATIVOS (que já pagaram e foram confirmados)
        const confirmedOnes = result.filter((s: Student) => s.status === "ATIVO");
        setData(confirmedOnes);
      } catch (error) {
        toast.error("Erro ao carregar lista de matriculados.");
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, [token]);

  const filteredStudents = data.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.whatsappNumber?.includes(search)
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Estudantes Matriculados <CheckCircle2 className="text-emerald-500 w-6 h-6" />
          </h1>
          <p className="text-sm text-muted-foreground">
            Listagem de alunos com <b>inscrição paga</b> e matrícula confirmada.
          </p>
        </div>
        <Link href="/dashboard/registrations/new">
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <UserPlus className="w-4 h-4" /> Nova Matrícula
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar matriculado..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold">Nome do Aluno</TableHead>
              <TableHead className="font-bold">Curso</TableHead>
              <TableHead className="font-bold">Contacto</TableHead>
              <TableHead className="font-bold">Financeiro</TableHead>
              <TableHead className="text-right font-bold">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                  <p className="text-muted-foreground">Buscando registros confirmados...</p>
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-20">
                  Nenhum aluno com inscrição paga encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-semibold text-slate-900">
                    {student.name}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {student.enrollments?.[0]?.course?.name || "Sem curso"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                      {student.whatsappNumber || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-100 text-emerald-700 border-none">
                      Inscrição OK
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Link corrigido para coincidir com a sua rota de detalhes */}
                    <Link href={`/dashboard/studants/${student.id}`}>
                      <Button variant="outline" size="sm" className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50">
                        Ver Perfil / Pagar <ExternalLink className="w-3.5 h-3.5" />
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