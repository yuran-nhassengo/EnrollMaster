"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, BookOpen } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Estados dos dados
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [studentName, setStudentName] = useState("");
  const [phone, setPhone] = useState("");
  const [courseId, setCourseId] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const token = useMemo(() => {
    return user?.access_token || (typeof window !== "undefined" && JSON.parse(localStorage.getItem("user") || "{}").access_token);
  }, [user]);

  // 1. CARREGAR DADOS INICIAIS
  useEffect(() => {
    async function loadData() {
      if (!token || !params.id) return;
      try {
        const [resStudent, resSubs] = await Promise.all([
          fetch(`http://localhost:3001/students/${params.id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:3001/subjects", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (resStudent.ok) {
          const s = await resStudent.json();
          setStudentName(s.name);
          setPhone(s.whatsappNumber || "");
          
          const enrollment = s.enrollments?.[0];
          if (enrollment) {
            setCourseId(enrollment.courseId);
            setSelectedSubjects(enrollment.subjects.map((es: any) => es.subjectId));
          }
        }
        if (resSubs.ok) setAllSubjects(await resSubs.json());
      } catch (err) {
        toast.error("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.id, token]);

  const toggleSubject = (id: string) => {
    setSelectedSubjects(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // 2. ENVIAR ATUALIZAÇÃO (O "Matador" de Duplicados)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return; 
    setSubmitting(true);

    try {
      const res = await fetch(`http://localhost:3001/enrollments/update-full/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: studentName,
          whatsappNumber: phone,
          courseId,
          subjectIds: selectedSubjects
        }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar.");

      toast.success("Atualizado com sucesso!");
      router.push(`/dashboard/students/${params.id}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-primary" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Editar Perfil e Disciplinas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Aluno</Label>
                <Input value={studentName} onChange={(e) => setStudentName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp (ID Único)</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Selecionar Disciplinas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {allSubjects.map((s) => {
                const isSelected = selectedSubjects.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleSubject(s.id)}
                    className={`p-2 border rounded-md cursor-pointer text-xs transition-all ${
                      isSelected ? "bg-primary text-white border-primary" : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    {s.name}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={submitting} className="w-full gap-2 h-12 text-lg">
          {submitting ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
          Salvar Alterações
        </Button>
      </form>
    </div>
  );
}