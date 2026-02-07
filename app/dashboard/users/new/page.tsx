"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import { Save, UserPlus } from "lucide-react";

type RoleType = "ADMIN" | "SUPER_ADMIN" | "STAFF";

export default function NewUserPage() {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contacto, setContacto] = useState("");
  const [role, setRole] = useState<RoleType>("ADMIN");
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Carrega escolas apenas se SUPER_ADMIN logado
  useEffect(() => {
    if (!user) return;

    async function loadSchools() {
      if (user.role === "SUPER_ADMIN") {
        try {
          const res = await fetch("http://localhost:3001/schools", {
            headers: { Authorization: `Bearer ${user.access_token}` },
          });
          const data = await res.json();
          setSchools(data);
        } catch {
          toast.error("Não foi possível carregar escolas");
        }
      }
      setLoading(false);
    }

    loadSchools();
  }, [user]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !email || !contacto || !role) {
      toast.error("Preencha todos os campos");
      return;
    }

    // 🔹 SUPER_ADMIN criando ADMIN ou STAFF deve escolher escola
    if (user?.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN" && !selectedSchool) {
      toast.error("Escolha uma escola para este usuário");
      return;
    }

    const payload = {
      name,
      email,
      contacto,
      role,
      schoolId:
        role === "SUPER_ADMIN"
          ? null
          : user?.role === "SUPER_ADMIN"
          ? selectedSchool
          : user?.schoolId || null, // admins normais só criam usuários na própria escola
      password: "123456", // senha padrão
    };

    fetch("http://localhost:3001/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.access_token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao cadastrar usuário");
        return res.json();
      })
      .then(() => {
        toast.success("Usuário cadastrado com sucesso");
        setName("");
        setEmail("");
        setContacto("");
        setRole("ADMIN");
        setSelectedSchool(null);
      })
      .catch(() => toast.error("Erro ao cadastrar usuário"));
  }

  if (loading) return <p className="p-6 text-center">Carregando informações...</p>;

  return (
    <div className="p-6 max-w-3xl">


       {/* Formulário de Cadastro */}
        {user?.role !== "STAFF" && (
          <Card className="shadow-sm border-slate-200 self-start">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" /> Novo Acesso
              </CardTitle>
              <CardDescription>Atribua credenciais a um novo colaborador.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input placeholder="Nome do utilizador" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Email Institucional</Label>
                  <Input type="email" placeholder="exemplo@escola.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Contacto Telefónico</Label>
                  <Input placeholder="Ex: 84XXXXXXX" value={contacto} onChange={(e) => setContacto(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Nível de Acesso</Label>
                  <Select value={role} onValueChange={(val) => setRole(val as RoleType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Administrador de Escola</SelectItem>
                      <SelectItem value="STAFF">Secretaria / Staff</SelectItem>
                      {user?.role === "SUPER_ADMIN" && (
                        <SelectItem value="SUPER_ADMIN" className="text-red-600 font-semibold">Super Admin Global</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {user?.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN" && (
                  <div className="space-y-2">
                    <Label>Vincular à Escola</Label>
                    <Select value={selectedSchool || ""} onValueChange={setSelectedSchool}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a unidade escolar" />
                      </SelectTrigger>
                      <SelectContent>
                        {schools.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button type="submit" className="w-full gap-2 mt-2 shadow-md">
                  <Save className="w-4 h-4" /> Finalizar Cadastro
                </Button>
              </form>
            </CardContent>
          </Card>
        )} 
     
    </div>
  );
}
