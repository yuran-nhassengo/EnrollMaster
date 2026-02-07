"use client";

import { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
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
  ShieldCheck, 
  School, 
  UserPlus, 
  Search, 
  Mail, 
  Phone,
  MoreVertical,
  Save,
  ShieldAlert,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";

type RoleType = "ADMIN" | "SUPER_ADMIN" | "STAFF";

interface UserAccount {
  id: string;
  name: string;
  email: string;
  contacto: string;
  role: RoleType;
  schoolId?: string;
  schoolName?: string;
}

export default function UsersManagementPage() {
  const { user } = useAuth();

  // Estados do Formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contacto, setContacto] = useState("");
  const [role, setRole] = useState<RoleType>("ADMIN");
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  
  // Estados de Dados
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

 useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${user.access_token}` };
        const usersRes = await fetch("http://localhost:3001/users", { headers });
        
        if (!usersRes.ok) throw new Error("Erro na API");
        const usersData = await usersRes.json();
        
        console.log("--- DEBUG DE FILTRAGEM ---",usersData);
        console.log("ID da minha escola (Contexto):", user.schoolId);

        if (user.role === "ADMIN") {
          const mySchoolId = String(user.schoolId || "").trim();

          const filtered = usersData.filter((u: UserAccount) => {
            // TENTATIVA DE EXTRAÇÃO:
            // 1. Tenta u.schoolId (Raiz)
            // 2. Tenta u.school.id (Aninhado - o que parece ser o seu caso)
            const extractedId = u.schoolId || u.school?.id;
            const uSchoolId = String(extractedId || "").trim();
            
            const isMatch = uSchoolId === mySchoolId;
            
            console.log(`Verificando ${u.email}: ID Extraído="${uSchoolId}" | Match=${isMatch}`);
            
            return isMatch;
          });

          console.log("Total após filtro:", filtered.length);
          setUsersList(filtered);
        } else {
          setUsersList(usersData);
        }
      } catch (err) {
        console.error("Erro no fetchData:", err);
        toast.error("Erro ao carregar utilizadores");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !email || !contacto || !role) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (user?.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN" && !selectedSchool) {
      toast.error("Escolha uma escola para este usuário");
      return;
    }

    const payload = {
      name,
      email,
      contacto,
      role,
      schoolId: role === "SUPER_ADMIN" ? null : user?.role === "SUPER_ADMIN" ? selectedSchool : user?.schoolId,
      password: "123456",
    };

    fetch("http://localhost:3001/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.access_token}`,
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const newUser = await res.json();
        toast.success("Usuário cadastrado com sucesso");
        setUsersList([newUser, ...usersList]);
        resetForm();
      })
      .catch(() => toast.error("Erro ao cadastrar usuário"));
  }

  const resetForm = () => {
    setName("");
    setEmail("");
    setContacto("");
    setRole("ADMIN");
    setSelectedSchool(null);
  };

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estatísticas Dinâmicas
  const stats = {
    total: usersList.length,
    admins: usersList.filter(u => u.role === "ADMIN").length,
    staff: usersList.filter(u => u.role === "STAFF").length,
    superAdmins: usersList.filter(u => u.role === "SUPER_ADMIN").length,
    schoolsCount: schools.length
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Utilizadores</h1>
          <p className="text-muted-foreground">
            {user?.role === "SUPER_ADMIN" ? "Painel de Controlo Global do Ecossistema" : `Gestão da Unidade - ${user?.schoolName || 'Escola'}`}
          </p>
        </div>
         <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" /> Filtros
          </Button>
          <Link href="/dashboard/users/new">
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" /> Novo Usuario
            </Button>
          </Link>
        </div>
      </div>

       {/* Cards de Resumo - Adaptados para Super Admin e Admin */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Global ou Local */}
        <Card className="border-l-4 border-l-blue-600 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Utilizadores</p>
                <h3 className="text-2xl font-bold">{stats.total}</h3>
              </div>
              <Users className="text-blue-600 w-8 h-8 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Admins (Vísivel para Super Admin e Admin) */}
        {user?.role !== "STAFF" && (
          <Card className="border-l-4 border-l-amber-500 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Administradores</p>
                  <h3 className="text-2xl font-bold">{stats.admins}</h3>
                </div>
                <ShieldCheck className="text-amber-500 w-8 h-8 opacity-20" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card 3: Staff / Secretaria */}
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Membros Staff</p>
                <h3 className="text-2xl font-bold">{stats.staff}</h3>
              </div>
              <Users className="text-emerald-500 w-8 h-8 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Especial para Super Admin (Total de Escolas) ou Super Admins */}
        {user?.role === "SUPER_ADMIN" ? (
          <Card className="border-l-4 border-l-purple-600 shadow-sm bg-purple-50/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Total de Escolas</p>
                  <h3 className="text-2xl font-bold text-purple-900">{stats.schoolsCount}</h3>
                </div>
                <School className="text-purple-600 w-8 h-8 opacity-30" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-l-4 border-l-slate-400 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Minha Unidade</p>
                  <h3 className="text-sm font-bold truncate max-w-[150px]">{user?.schoolName || "Sede"}</h3>
                </div>
                <School className="text-slate-400 w-8 h-8 opacity-20" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
       

        {/* Tabela de Listagem */}
        <Card className={`shadow-sm border-slate-200 ${user?.role === "STAFF" ? 'xl:col-span-3' : 'xl:col-span-2'}`}>
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle>Listagem de Utilizadores</CardTitle>
              <CardDescription>
                {user?.role === "SUPER_ADMIN" ? "Todos os acessos do ecossistema" : "Colaboradores da sua unidade"}
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar utilizador..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-bold">Identificação</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Contacto</TableHead>
                  {user?.role === "SUPER_ADMIN" && <TableHead>Unidade</TableHead>}
                  <TableHead className="text-right">Gestão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={user?.role === "SUPER_ADMIN" ? 5 : 4} className="text-center py-12 text-muted-foreground">
                      Nenhum utilizador encontrado na base de dados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">{u.name}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 italic">
                            <Mail className="w-3 h-3" /> {u.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={u.role === "SUPER_ADMIN" ? "destructive" : u.role === "ADMIN" ? "default" : "secondary"}
                          className="text-[10px] font-bold tracking-tight px-2"
                        >
                          {u.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm flex items-center gap-1 font-medium text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {u.contacto}
                        </span>
                      </TableCell>
                      {user?.role === "SUPER_ADMIN" && (
                        <TableCell>
                          <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded border">
                            {u.role === "SUPER_ADMIN" ? "GLOBAL" : (u.schoolName || "N/D")}
                          </span>
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}