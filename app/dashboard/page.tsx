"use client";

import { useEffect, useState } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import { Users, GraduationCap, Wallet, BarChart3 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token =
    user?.access_token ||
    (typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}").access_token
      : "");

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token]);

  async function loadData() {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [coursesRes, studentsRes, enrollmentsRes] = await Promise.all([
        fetch("http://localhost:3001/courses", { headers }),
        fetch("http://localhost:3001/students", { headers }),
        fetch("http://localhost:3001/enrollments", { headers }),
      ]);

      if (coursesRes.ok)     setCourses(await coursesRes.json());
      if (studentsRes.ok)    setStudents(await studentsRes.json());
      if (enrollmentsRes.ok) setEnrollments(await enrollmentsRes.json());
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  // ── KPIs ──────────────────────────────────────────────────────
  const totalStudents    = students.length;
  const totalCourses     = courses.length;
  const totalPaid        = enrollments.filter(e => e.status === "PAGO").length;
  const totalPending     = enrollments.filter(e => e.status === "PENDENTE").length;

  const averageAge = (() => {
    const ages = students
      .filter(s => s.birthDate)
      .map(s => {
        const parts = s.birthDate.split("/");
        if (parts.length !== 3) return null;
        const birth = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        return Math.floor((Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365));
      })
      .filter(Boolean) as number[];
    return ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;
  })();

  // ── Inscrições por mês ────────────────────────────────────────
  const lineData = Object.values(
    enrollments.reduce((acc: any, e) => {
      const month = new Date(e.createdAt).toLocaleString("pt-PT", { month: "short" });
      acc[month] = acc[month] || { month, inscritos: 0 };
      acc[month].inscritos += 1;
      return acc;
    }, {})
  );

  // ── Alunos por curso ──────────────────────────────────────────
  const barData = courses.map(c => ({
    course: c.name,
    alunos: enrollments.filter(e => e.courseId === c.id).length,
  }));

  // ── Status de pagamento ───────────────────────────────────────
  const paymentData = [
    { name: "Pago",     value: totalPaid },
    { name: "Pendente", value: totalPending },
  ];

  // ── Alunos por género ─────────────────────────────────────────
  const genderData = [
    { name: "Masculino", value: students.filter(s => s.gender === "M").length },
    { name: "Feminino",  value: students.filter(s => s.gender === "F").length },
    { name: "Outro",     value: students.filter(s => !s.gender).length },
  ];

  // ── Origem da inscrição ───────────────────────────────────────
  const originData = [
    { name: "WhatsApp", value: students.filter(s => s.whatsappNumber).length },
    { name: "Manual",   value: students.filter(s => !s.whatsappNumber).length },
  ];

  const pieColors = ["#16a34a", "#dc2626", "#facc15", "#3b82f6", "#8b5cf6"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full">

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-sm">Total de alunos</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalStudents}</p>
            <p className="text-xs text-muted-foreground">Registados no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-sm">Cursos activos</CardTitle>
            <GraduationCap className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalCourses}</p>
            <p className="text-xs text-muted-foreground">Disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-sm">Inscrições pagas</CardTitle>
            <Wallet className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalPaid}</p>
            <p className="text-xs text-muted-foreground">{totalPending} pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-sm">Idade média</CardTitle>
            <BarChart3 className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{averageAge || "—"}</p>
            <p className="text-xs text-muted-foreground">anos</p>
          </CardContent>
        </Card>
      </div>

      {/* GRÁFICOS PRINCIPAIS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>Inscrições por mês</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="inscritos" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Status de pagamentos</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
                  {paymentData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#16a34a" : "#dc2626"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* BARRAS E PIE ADICIONAIS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Alunos por curso</CardTitle></CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="alunos" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Alunos por género</CardTitle></CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  {genderData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Origem das inscrições</CardTitle></CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={originData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  {originData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}