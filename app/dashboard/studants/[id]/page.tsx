"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, Edit, BookOpen, DollarSign, 
  Loader2, Wallet, Printer, AlertCircle 
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const token = useMemo(() => {
    return user?.access_token || (typeof window !== "undefined" && JSON.parse(localStorage.getItem("user") || "{}").access_token);
  }, [user]);

  useEffect(() => {
    async function loadData() {
      if (!token || !params.id) return;
      try {
        const res = await fetch(`http://localhost:3001/students/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setStudent(data);
      } catch (err) {
        toast.error("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.id, token]);

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-primary" /></div>;
  if (!student) return <div className="p-20 text-center">Estudante não encontrado.</div>;

  // LÓGICA BASEADA NO SEU SCHEMA (CoursePriceRule)
  const enrollment = student.enrollments?.[0];
  const course = enrollment?.course;
  const numDisciplinas = enrollment?.subjects?.length || 0;

  // Encontra a regra de preço para a quantidade de disciplinas que o aluno escolheu
  const priceRule = course?.priceRules?.find(
    (rule: any) => rule.subjectCount === numDisciplinas
  );

  const valorMensalidadeCalculado = priceRule?.price || 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="h-4 w-4"/>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{student.name}</h1>
            <div className="flex gap-2">
              <Badge>{student.status}</Badge>
              <Badge variant="secondary">{course?.name}</Badge>
            </div>
          </div>
        </div>
        <Button onClick={() => router.push(`/dashboard/studants/edit/${student.id}`)} className="gap-2">
          <Edit className="h-4 w-4" /> Editar Aluno / Disciplinas
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* DISCIPLINAS (Baseado em EnrollmentSubject do seu Schema) */}
          <Card>
            <CardHeader className="bg-slate-50">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Disciplinas Selecionadas ({numDisciplinas})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {enrollment?.subjects?.map((es: any) => (
                  <div key={es.id} className="p-3 border rounded-md bg-white text-sm">
                    {es.subject.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* PAGAMENTOS (Baseado em Payment do seu Schema) */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-lg">Histórico de Pagamentos</CardTitle>
              <Button size="sm" className="bg-emerald-600 gap-2"><Wallet className="h-4 w-4" /> Receber</Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-y">
                  <tr>
                    <th className="p-4 text-left">Tipo</th>
                    <th className="p-4 text-left">Mês/Ano</th>
                    <th className="p-4 text-left">Valor</th>
                    <th className="p-4 text-left">Multa</th>
                    <th className="p-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {student.payments?.map((p: any) => (
                    <tr key={p.id}>
                      <td className="p-4 font-medium">{p.type}</td>
                      <td className="p-4">{p.month ? `${p.month}/${p.year}` : '-'}</td>
                      <td className="p-4">{p.amount} MZN</td>
                      <td className="p-4 text-red-500">{p.penalty > 0 ? `+${p.penalty}` : '0'}</td>
                      <td className="p-4">
                        <Badge variant={p.isPaid ? "default" : "destructive"}>
                          {p.isPaid ? "Pago" : "Pendente"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* RESUMO FINANCEIRO (Baseado no PriceRule) */}
        <div className="space-y-6">
          <Card className="bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="text-xs text-slate-400 uppercase">Mensalidade Atual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-emerald-400">{valorMensalidadeCalculado} MZN</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Regra aplicada: {numDisciplinas} disciplina(s)
                </p>
              </div>
              <Separator className="bg-slate-800" />
              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Inscrição do Curso:</span>
                  <span>{course?.registrationFee} MZN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duração:</span>
                  <span>{course?.durationMonths} meses</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {!priceRule && numDisciplinas > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
              <AlertCircle className="text-amber-600 h-5 w-5 shrink-0" />
              <p className="text-xs text-amber-700">
                <b>Atenção:</b> Não existe uma regra de preço definida para {numDisciplinas} disciplinas neste curso. O valor está em 0 MZN.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}