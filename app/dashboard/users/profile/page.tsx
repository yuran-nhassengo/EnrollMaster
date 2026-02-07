"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Building2, 
  ArrowLeft,
  Trash2,
  Edit,
  History,
  Lock
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";

type User = {
  id: string;
  name: string;
  contacto: string;
  email: string;
  role: string;
  school: { id: string; name: string } | null;
};

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserDetail() {
      const token = authUser?.access_token || JSON.parse(localStorage.getItem("user") || "{}").access_token;
      
      if (!token) {
        toast.error("Sessão expirada");
        router.push("/login");
        return;
      }

      try {
        // Busca o detalhe do utilizador específico pelo ID da URL
        const response = await fetch(`http://localhost:3001/users/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Erro ao carregar os dados do utilizador");

        const data = await response.json();
        setTargetUser(data);
      } catch (error) {
        toast.error("Não foi possível carregar os detalhes do utilizador");
        router.push("/dashboard/users");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchUserDetail();
    }
  }, [params.id, authUser, router]);

  if (loading) {
    return (
      <div className="p-10 text-center space-y-4 animate-pulse">
        <div className="w-12 h-12 bg-slate-200 rounded-full mx-auto" />
        <p className="text-muted-foreground">A carregar perfil do utilizador...</p>
      </div>
    );
  }

  if (!targetUser) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Botão Voltar e Ações */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} title="Voltar">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{targetUser.name}</h1>
            <p className="text-sm text-muted-foreground font-mono">ID: {targetUser.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Edit className="w-4 h-4" /> Editar Perfil
          </Button>
          <Button variant="destructive" size="sm" className="gap-2">
            <Trash2 className="w-4 h-4" /> Desativar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-primary" /> Dados do Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Email */}
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Endereço de Email</p>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{targetUser.email}</span>
                </div>
              </div>

              {/* Contacto */}
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Telefone / Contacto</p>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{targetUser.contacto || "Não definido"}</span>
                </div>
              </div>

              {/* Tipo de Acesso */}
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Nível de Acesso</p>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <Badge variant="secondary" className="font-bold uppercase text-[10px]">
                    {targetUser.role}
                  </Badge>
                </div>
              </div>

              {/* Escola Vinculada */}
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Instituição Vinculada</p>
                <div className="flex items-center gap-2 text-slate-700">
                  <Building2 className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">
                    {targetUser.school ? targetUser.school.name : "Administração Central"}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Informação Adicional de Segurança */}
            <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <Lock className="w-5 h-5 text-amber-600 mt-1" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">Segurança da Conta</h4>
                <p className="text-sm text-amber-800/80 leading-relaxed">
                  Este utilizador tem permissões de <span className="font-bold underline">{targetUser.role}</span>. 
                  Qualquer alteração crítica nos dados de acesso requer re-autenticação do administrador.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar de Atividade e Status */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase text-muted-foreground tracking-tight">Status da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Estado</span>
                <Badge className="bg-emerald-500 hover:bg-emerald-600">Ativo</Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Último Acesso</span>
                <span className="font-medium">Hoje, 10:45</span>
              </div>
              <Separator />
              <div className="pt-2">
                <Button variant="ghost" className="w-full justify-between text-xs text-blue-600 font-semibold p-0 h-auto hover:bg-transparent">
                  Ver Logs de Atividade <History className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg space-y-4">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold">Gestão de Privilégios</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pode alterar as permissões de acesso deste utilizador ou transferi-lo para outra unidade escolar se necessário.
            </p>
            <div className="pt-2">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-xs font-bold uppercase tracking-wider">
                Alterar Cargo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}