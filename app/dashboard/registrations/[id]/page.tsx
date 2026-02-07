"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Phone, 
  GraduationCap, 
  Calendar, 
  Clock, 
  ArrowLeft,
  Trash2,
  Edit,
  Smartphone,
  Info,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Hash
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";

// Tipagem sincronizada com o Backend
type EnrollmentDetail = {
  id: string;
  status: string;
  createdAt: string;
  student: {
    id: string;
    name: string;
    whatsappNumber: string | null;
    status: string;
  };
  course: {
    id: string;
    name: string;
    registrationFee: number;
  };
  subjects: {
    subject: { name: string };
  }[];
};

export default function RegistrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const [registration, setRegistration] = useState<EnrollmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const token = useMemo(() => {
    return user?.access_token || (typeof window !== "undefined" && JSON.parse(localStorage.getItem("user") || "{}").access_token);
  }, [user]);

  useEffect(() => {
    async function fetchDetail() {
      if (!token || !id) return;
      try {
        // Buscamos todas e filtramos ou criamos um endpoint de findOne no backend
        const response = await fetch(`http://localhost:3001/enrollments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!response.ok) throw new Error();
        const data: EnrollmentDetail[] = await response.json();
        const found = data.find(item => item.id === id);
        
        if (found) {
          setRegistration(found);
        } else {
          toast.error("Inscrição não encontrada no servidor.");
          router.push("/dashboard/registrations");
        }
      } catch (error) {
        toast.error("Erro ao carregar detalhes.");
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id, token, router]);

  const handleConfirmPayment = async () => {
    if (!registration || !token) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`http://localhost:3001/enrollments/${id}/confirm-payment`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error();

      toast.success("Pagamento confirmado e aluno ativado!");
      
      // Atualiza o estado local para refletir a mudança
      setRegistration({ ...registration, status: 'PAGO' });
      router.refresh();
    } catch (error) {
      toast.error("Erro ao confirmar pagamento no servidor.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Consultando base de dados...</p>
      </div>
    );
  }

  if (!registration) return null;

  const isPaid = registration.status === "PAGO";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-slate-100">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{registration.student.name}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                ID: {registration.id.slice(-6).toUpperCase()}
              </Badge>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {new Date(registration.createdAt).toLocaleDateString('pt-PT')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" className="gap-2 opacity-50 hover:opacity-100">
            <Trash2 className="w-4 h-4" /> Anular Inscrição
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b py-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-700">
                <User className="w-4 h-4 text-primary" /> Dados do Aluno
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Contacto WhatsApp</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-500" /> 
                    {registration.student.whatsappNumber || "Não registado"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status do Aluno</p>
                  <Badge className="capitalize">{registration.student.status.replace('_', ' ')}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b py-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-700">
                <GraduationCap className="w-4 h-4 text-primary" /> Plano de Estudos
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Curso</p>
                    <p className="text-sm font-bold text-slate-800">{registration.course.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Taxa de Inscrição</p>
                    <p className="text-sm font-mono font-bold text-emerald-600">
                      {registration.course.registrationFee.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Disciplinas Selecionadas</p>
                  <div className="flex flex-wrap gap-2">
                    {registration.subjects.map((s, i) => (
                      <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                        {s.subject.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral */}
        <div className="space-y-6">
          <Card className={`shadow-md border-2 transition-all ${isPaid ? 'border-emerald-500 shadow-emerald-50' : 'border-amber-500 shadow-amber-50'}`}>
            <CardHeader className={`${isPaid ? 'bg-emerald-50/50' : 'bg-amber-50/50'} py-4 border-b`}>
              <CardTitle className="text-xs font-black uppercase tracking-tighter text-center">
                Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="text-center space-y-3">
                {isPaid ? (
                  <div className="animate-in zoom-in duration-300">
                    <div className="inline-flex p-4 bg-emerald-100 text-emerald-600 rounded-full mb-3">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-emerald-700">PAGO</h3>
                    <p className="text-xs text-emerald-600 font-medium">Inscrição Validada</p>
                  </div>
                ) : (
                  <div className="animate-in zoom-in duration-300">
                    <div className="inline-flex p-4 bg-amber-100 text-amber-600 rounded-full mb-3">
                      <AlertCircle className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-amber-700">PENDENTE</h3>
                    <p className="text-xs text-amber-600 font-medium">Aguardando Valor</p>
                  </div>
                )}
              </div>

              {!isPaid && (
                <div className="space-y-3">
                  <Separator />
                  <Button 
                    onClick={handleConfirmPayment}
                    disabled={updating}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 font-bold shadow-lg"
                  >
                    {updating ? <Loader2 className="animate-spin" /> : <CreditCard className="mr-2 w-5 h-5" />}
                    Confirmar Pagamento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Button 
            variant="outline" 
            className="w-full h-12 gap-3 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            onClick={() => window.open(`https://wa.me/${registration.student.whatsappNumber?.replace(/\s/g, '')}`, '_blank')}
          >
            <Smartphone className="w-5 h-5" />
            Contactar Candidato
          </Button>
        </div>
      </div>
    </div>
  );
}