"use client";

import { useEffect, useState } from "react";
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
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";
import { PlusCircle, BookOpen } from "lucide-react";
import SubjectsManager from "../subjects/subjects-manager";

type Course = {
  id: string;
  name: string;
  type: string;
  durationMonths: number;
  registrationFee: number;
  priceRules: { subjectCount: number; price: number }[];
  _count?: { enrollments: number; subjects: number };
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const token =
    user?.access_token ||
    (typeof window !== "undefined" &&
      JSON.parse(localStorage.getItem("user") || "{}").access_token);

  async function loadCourses() {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCourses(data);
    } catch {
      toast.error("Erro ao carregar cursos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) loadCourses();
  }, [token]);

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho com botões lado a lado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cursos e Matérias</h1>
          <p className="text-sm text-muted-foreground">
            Configure os preços e as disciplinas da sua escola.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/courses/new">
            <Button className="gap-2">
              <PlusCircle className="w-4 h-4" /> Novo Curso
            </Button>
          </Link>

          {/* Botão de Disciplinas (Gerenciador) */}
          <SubjectsManager />
        </div>
      </div>

      {/* Tabela de cursos */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Curso / Disciplinas</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Preços Mensais</TableHead>
              <TableHead className="text-center">Alunos</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  <div className="flex justify-center items-center gap-2 text-muted-foreground">
                    <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Carregando...
                  </div>
                </TableCell>
              </TableRow>
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                  Nenhum curso cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              courses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="font-bold text-base text-slate-800">{c.name}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold">
                        {c.type}
                      </Badge>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> {c._count?.subjects || 0}{" "}
                        disciplinas
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm">{c.durationMonths} meses</TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[300px]">
                      {c.priceRules
                        ?.sort((a, b) => a.subjectCount - b.subjectCount)
                        .map((rule, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-[10px] font-normal"
                          >
                            {rule.subjectCount}x: {rule.price}MT
                          </Badge>
                        ))}
                    </div>
                  </TableCell>

                  <TableCell className="text-center font-medium">
                    {c._count?.enrollments || 0}
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