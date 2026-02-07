"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Smartphone, 
  UserPlus, 
  ArrowUpRight,
  Filter,
  BookOpen
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

// Tipagem baseada no seu novo Schema Prisma
type Enrollment = {
  id: string;
  status: string;
  createdAt: string;
  student: {
    name: string;
    whatsappNumber: string | null;
    status: string;
  };
  course: {
    name: string;
    registrationFee: number;
  };
  subjects: {
    subject: {
      name: string;
    };
  }[];
};

export default function RegistrationsPage() {
  const [data, setData] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchEnrollments() {
      const token = user?.access_token || (typeof window !== "undefined" && JSON.parse(localStorage.getItem("user") || "{}").access_token);

      if (!token) return;

      try {
        // ROTA ATUALIZADA: /enrollments
        const response = await fetch("http://localhost:3001/enrollments", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error();
        const result = await response.json();
        setData(result);
      } catch (error) {
        toast.error("Erro ao carregar inscrições.");
      } finally {
        setLoading(false);
      }
    }

    fetchEnrollments();
  }, [user]);

  // Cálculos baseados no novo schema
  const totalInscricoes = data.length;
  const pendentes = data.filter(e => e.status === "PENDENTE").length;
  const whatsappInscriptions = data.filter(e => e.student.whatsappNumber).length;

  return (
    <div className="p-6 space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestão de Inscrições</h1>
          <p className="text-muted-foreground italic text-sm">Controle de novos ingressos e taxas de inscrição.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" /> Filtros
          </Button>
          <Link href="/dashboard/registrations/new">
            <Button className="gap-2 shadow-md">
              <UserPlus className="w-4 h-4" /> Nova Inscrição
            </Button>
          </Link>
        </div>
      </div>

      {/* Cartões de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Inscritos</p>
                <h3 className="text-2xl font-bold">{totalInscricoes}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pagamentos Pendentes</p>
                <h3 className="text-2xl font-bold text-yellow-600">{pendentes}</h3>
              </div>
              <div className="p-2 bg-yellow-50 rounded-full text-yellow-600">
                <Badge variant="outline" className="border-yellow-200">Aguardando</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Via WhatsApp</p>
                <h3 className="text-2xl font-bold">{whatsappInscriptions}</h3>
              </div>
              <div className="p-2 bg-emerald-50 rounded-full text-emerald-600">
                <Smartphone className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Inscrições */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-500" />
            Inscrições Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-bold">Estudante</TableHead>
                <TableHead>Curso Escolhido</TableHead>
                <TableHead>Disciplinas</TableHead>
                <TableHead>Status Pgto</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10">Carregando...</TableCell></TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Nenhuma inscrição pendente.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((enrollment) => (
                  <TableRow key={enrollment.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{enrollment.student.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {enrollment.student.whatsappNumber || "Sem WhatsApp"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{enrollment.course.name}</div>
                      <div className="text-xs text-blue-600 font-mono">
                        {enrollment.course.registrationFee.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {enrollment.subjects.map((s, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[10px] px-1 py-0 h-4">
                            {s.subject.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={enrollment.status === "PAGO" ? "default" : "outline"}
                        className={enrollment.status === "PAGO" ? "bg-emerald-500 hover:bg-emerald-600" : "text-yellow-600 border-yellow-200"}
                      >
                        {enrollment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(enrollment.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/registrations/${enrollment.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50">
                          <ArrowUpRight className="w-4 h-4 text-blue-600" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}