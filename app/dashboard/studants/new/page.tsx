"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, User, Smartphone, Activity } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados dos campos editáveis
  const [formData, setFormData] = useState({
    name: "",
    whatsappNumber: "",
    status: "",
  });

  const token = useMemo(() => {
    return user?.access_token || (typeof window !== "undefined" && JSON.parse(localStorage.getItem("user") || "{}").access_token);
  }, [user]);

  // Carrega os dados atuais do estudante
  useEffect(() => {
    async function fetchStudent() {
      if (!token || !id) return;
      try {
        const res = await fetch(`http://localhost:3001/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        setFormData({
          name: data.name,
          whatsappNumber: data.whatsappNumber || "",
          status: data.status,
        });
      } catch (err) {
        toast.error("Erro ao carregar dados para edição.");
        router.back();
      } finally {
        setLoading(false);
      }
    }
    fetchStudent();
  }, [id, token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`http://localhost:3001/students/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();

      toast.success("Dados atualizados com sucesso!");
      router.push(`/dashboard/students/${id}`); // Volta para a visualização
    } catch (err) {
      toast.error("Erro ao salvar alterações no servidor.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-20 flex flex-col items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Carregando formulário...</p>
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Perfil</h1>
          <p className="text-sm text-muted-foreground">ID do Estudante: {id.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* NOME */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input 
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* WHATSAPP */}
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="flex items-center gap-2">
                    <Smartphone className="w-3 h-3" /> Contacto WhatsApp
                  </Label>
                  <Input 
                    id="whatsapp"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})}
                  />
                </div>

                {/* STATUS */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="flex items-center gap-2">
                    <Activity className="w-3 h-3" /> Estado do Estudante
                  </Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRE_INSCRITO">Pré-Inscrito</SelectItem>
                      <SelectItem value="ATIVO">Ativo / Matriculado</SelectItem>
                      <SelectItem value="INATIVO">Inativo / Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              disabled={saving}
            >
              Descartar
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90 px-8"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}