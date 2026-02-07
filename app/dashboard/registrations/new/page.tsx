"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, UserPlus, BookOpen, Banknote, Loader2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

type Course = { id: string; name: string; registrationFee: number };
type Subject = { id: string; name: string };

const inputClass = "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export default function NewRegistrationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);

  const [studentName, setStudentName] = useState("");
  const [phone, setPhone] = useState("");
  const [courseId, setCourseId] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  
  const [payNow, setPayNow] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Numerário");

  const token = useMemo(() => {
    return user?.access_token || (typeof window !== "undefined" && JSON.parse(localStorage.getItem("user") || "{}").access_token);
  }, [user]);

  useEffect(() => {
    if (!token) return;
    async function loadResources() {
      try {
        const [resC, resS] = await Promise.all([
          fetch("http://localhost:3001/courses", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:3001/subjects", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (resC.ok) setCourses(await resC.json());
        if (resS.ok) setAllSubjects(await resS.json());
      } catch (err) {
        toast.error("Erro ao carregar dados iniciais.");
      }
    }
    loadResources();
  }, [token]);

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setCourseId(id);
    const selected = courses.find((c) => c.id === id);
    if (selected) {
      setAmountPaid(selected.registrationFee.toString());
    }
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjects(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

 async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  
  // SE JÁ ESTIVER CARREGANDO, PARA AQUI (Evita duplicar requisição no clique)
  if (loading) return; 

  if (!studentName || !courseId || selectedSubjects.length === 0) {
    return toast.error("Preencha todos os campos obrigatórios.");
  }

  setLoading(true); // Bloqueia o botão imediatamente

  try {
    const response = await fetch("http://localhost:3001/enrollments/full-registration", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ 
        name: studentName, 
        whatsappNumber: phone,
        courseId,
        subjectIds: selectedSubjects,
        paymentConfirmed: payNow,
        amountPaid: parseFloat(amountPaid) || 0,
        paymentMethod
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Erro ao processar.");
    }

    toast.success("Inscrição realizada com sucesso!");
    router.push("/dashboard/registrations");
  } catch (err: any) {
    toast.error(err.message);
    setLoading(false); // SÓ libera o botão se der erro para tentar novamente
  }
}
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 text-slate-900">
      <Button variant="ghost" type="button" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      <Card className="shadow-lg border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="flex items-center gap-2 font-bold text-xl">
            <UserPlus className="w-5 h-5 text-primary" /> Nova Inscrição Consolidada
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Nome Completo</Label>
                <Input 
                  placeholder="Nome do aluno" 
                  value={studentName} 
                  onChange={(e) => setStudentName(e.target.value)} 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input 
                  placeholder="Ex: 840000000" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Curso</Label>
                <select 
                  className={inputClass}
                  value={courseId}
                  onChange={handleCourseChange}
                  required
                >
                  <option value="" disabled>Selecione o curso</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="font-bold flex items-center gap-2 text-slate-700">
                <BookOpen className="w-4 h-4" /> Disciplinas ({selectedSubjects.length})
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {allSubjects.map((s) => {
                  const isSelected = selectedSubjects.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleSubject(s.id)}
                      className={`flex items-center gap-2 p-2 border rounded-md cursor-pointer select-none transition-all ${
                        isSelected ? "bg-primary/5 border-primary shadow-sm" : "hover:bg-slate-50 border-slate-200"
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="h-4 w-4 accent-primary cursor-pointer"
                      />
                      <span className={`text-xs truncate ${isSelected ? "font-bold text-primary" : "text-slate-600"}`}>
                        {s.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div className={`p-4 rounded-lg border-2 transition-colors ${payNow ? "border-emerald-500 bg-emerald-50/20" : "bg-slate-50/50 border-slate-100"}`}>
              <div className="flex items-center justify-between mb-4">
                <Label className="font-bold flex items-center gap-2">
                  <Banknote className={payNow ? "text-emerald-600" : "text-slate-400"} />
                  Confirmar Pagamento da Taxa?
                </Label>
                
                <div className="w-[100px]">
                  <select 
                    className={inputClass}
                    value={payNow ? "sim" : "nao"}
                    onChange={(e) => setPayNow(e.target.value === "sim")}
                  >
                    <option value="nao">Não</option>
                    <option value="sim">Sim</option>
                  </select>
                </div>
              </div>

              {payNow && (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <Label>Valor Pago (MZN)</Label>
                    <Input 
                      type="number" 
                      value={amountPaid} 
                      onChange={(e) => setAmountPaid(e.target.value)} 
                      className="bg-white" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Método</Label>
                    <select 
                      className={inputClass}
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="Numerário">Numerário</option>
                      <option value="M-Pesa">M-Pesa</option>
                      <option value="Transferência">Transferência</option>
                      <option value="POS">POS / Cartão</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-12 text-lg font-bold shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Finalizar Registo Único"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}