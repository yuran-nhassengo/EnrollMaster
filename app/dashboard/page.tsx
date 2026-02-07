"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Users, GraduationCap, Wallet, BarChart3 } from "lucide-react";

type Course = {
  id: string;
  name: string;
  classe: string;
  tipo: "Normal" | "Intensivo" | "Super-Intensivo";
  turno: "Matutino" | "Vespertino" | "Noturno";
};

type Registration = {
  id: string;
  courseId: string;
  origin: "manual" | "whatsapp";
  createdAt: string;
  gender: "Masculino" | "Feminino" | "Outro";
  birthDate: string;
  paymentStatus: "pre-inscricao" | "inscrito";
};

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  useEffect(() => {
    const c = localStorage.getItem("courses");
    const r = localStorage.getItem("registrations");
    setCourses(c ? JSON.parse(c) : []);
    setRegistrations(r ? JSON.parse(r) : []);
  }, []);

  const totalRegistrations = registrations.length;
  const totalCourses = courses.length;

  /** LINE CHART: INSCRIÇÕES POR MÊS */
  const lineData = Object.values(
    registrations.reduce((acc: any, r) => {
      const month = new Date(r.createdAt).toLocaleString("pt-PT", {
        month: "short",
      });
      acc[month] = acc[month] || { month, inscritos: 0 };
      acc[month].inscritos += 1;
      return acc;
    }, {})
  );

  /** BAR CHART: ALUNOS POR CURSO */
  const barData = courses.map((course) => ({
    course: course.name,
    alunos: registrations.filter((r) => r.courseId === course.id).length,
  }));

  /** BAR CHART: ALUNOS POR CLASSE */
  const classData = Array.from(new Set(courses.map((c) => c.classe))).map(
    (classe) => ({
      classe,
      alunos: registrations.filter((r) => {
        const c = courses.find((c) => c.id === r.courseId);
        return c?.classe === classe;
      }).length,
    })
  );

  /** PIE CHART: ALUNOS POR TURNO */
  const turnos = ["Matutino", "Vespertino", "Noturno"];
  const turnoData = turnos.map((turno) => ({
    name: turno,
    value: registrations.filter((r) => {
      const c = courses.find((c) => c.id === r.courseId);
      return c?.turno === turno;
    }).length,
  }));

  /** PIE CHART: ALUNOS POR TIPO */
  const tipos = ["Normal", "Intensivo", "Super-Intensivo"];
  const tipoData = tipos.map((tipo) => ({
    name: tipo,
    value: registrations.filter((r) => {
      const c = courses.find((c) => c.id === r.courseId);
      return c?.tipo === tipo;
    }).length,
  }));

  /** PIE CHART: ALUNOS POR GÊNERO */
  const genders = ["Masculino", "Feminino", "Outro"];
  const genderData = genders.map((g) => ({
    name: g,
    value: registrations.filter((r) => r.gender === g).length,
  }));

  /** PIE CHART: STATUS DE PAGAMENTO */
  const paymentData = [
    {
      name: "Inscrito (pago)",
      value: registrations.filter((r) => r.paymentStatus === "inscrito").length,
    },
    {
      name: "Pré-inscrição (não pago)",
      value: registrations.filter((r) => r.paymentStatus === "pre-inscricao").length,
    },
  ];

  /** IDADE MÉDIA */
  const ages = registrations.map((r) => {
    const birth = new Date(r.birthDate);
    const diff = Date.now() - birth.getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  });
  const averageAge = ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;

  /** PIE CHART COLORS */
  const pieColors = ["#16a34a", "#dc2626", "#facc15", "#3b82f6", "#8b5cf6"];

  return (
    <div className="p-6 space-y-6 w-full">

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-sm">Inscrições</CardTitle>
            <Users className="h-5 w-5 text-blue-600"/>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalRegistrations}</p>
            <p className="text-xs text-muted-foreground">Total registrado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-sm">Cursos ativos</CardTitle>
            <GraduationCap className="h-5 w-5 text-green-600"/>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalCourses}</p>
            <p className="text-xs text-muted-foreground">Disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-sm">Receita</CardTitle>
            <Wallet className="h-5 w-5 text-yellow-600"/>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">—</p>
            <p className="text-xs text-muted-foreground">Pagamento futuro</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-sm">Idade média</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{averageAge}</p>
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
                <Line type="monotone" dataKey="inscritos" stroke="#3b82f6" strokeWidth={3}/>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Status de pagamentos</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label
                >
                  {paymentData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#16a34a" : "#dc2626"} />
                  ))}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      {/* BARRAS E PIE ADICIONAIS */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        <Card>
          <CardHeader><CardTitle>Alunos por curso</CardTitle></CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="course"/>
                <YAxis allowDecimals={false}/>
                <Tooltip/>
                <Bar dataKey="alunos" fill="#10b981"/>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Alunos por classe</CardTitle></CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer>
              <BarChart data={classData}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="classe"/>
                <YAxis allowDecimals={false}/>
                <Tooltip/>
                <Bar dataKey="alunos" fill="#3b82f6"/>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader><CardTitle>Alunos por turno</CardTitle></CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={turnoData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {turnoData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card> */}

        {/* <Card>
          <CardHeader><CardTitle>Alunos por tipo</CardTitle></CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={tipoData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {tipoData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card> */}

      </div>

      {/* GÊNERO */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Alunos por gênero</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label
                >
                  {genderData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
