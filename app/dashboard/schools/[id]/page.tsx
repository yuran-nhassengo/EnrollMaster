"use client";

import React, { useEffect, useState } from "react";
import { 
  Building2, 
  Users, 
  BookOpen, 
  MapPin, 
  Phone, 
  ArrowLeft,
  Mail,
  ShieldCheck,
  MoreHorizontal,
  ExternalLink
} from "lucide-react";

/**
 * Nota: Como este ambiente é uma pré-visualização isolada, 
 * simulamos os hooks de navegação e autenticação que normalmente 
 * viriam do Next.js e do seu Contexto.
 */

const App = () => {
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulação de dados para fins de demonstração na pré-visualização
  useEffect(() => {
    const timer = setTimeout(() => {
      setSchool({
        id: "sch-mz-8821",
        name: "Instituto Politécnico de Maputo",
        location: "Matola, Fomento",
        contact: "+258 84 123 4567",
        createdAt: "2023-10-15T10:00:00Z",
        users: [
          { id: "1", name: "Albino Chilaule", email: "albino@escola.ac.mz", role: "Admin" },
          { id: "2", name: "Maria Tembe", email: "maria.t@escola.ac.mz", role: "Staff" },
        ],
        _count: {
          students: 1240,
          courses: 8,
        }
      });
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">A carregar detalhes da instituição...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header de Navegação */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border">
          <div className="flex items-center gap-5">
            <button className="p-3 hover:bg-slate-100 rounded-xl transition-colors border shadow-sm bg-white">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900">{school.name}</h1>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200 uppercase tracking-wider">
                  Ativa
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-2">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-500" /> {school.location}</span>
                <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-blue-500" /> {school.contact}</span>
              </div>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Inscrita desde</p>
            <p className="text-sm font-semibold text-slate-700">{new Date(school.createdAt).toLocaleDateString('pt-PT')}</p>
          </div>
        </div>

        {/* Grid de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center justify-between group hover:border-blue-200 transition-all">
            <div>
              <p className="text-sm font-medium text-slate-500">Alunos Ativos</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{school._count.students.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center justify-between group hover:border-indigo-200 transition-all">
            <div>
              <p className="text-sm font-medium text-slate-500">Cursos Ofertados</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{school._count.courses}</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform">
              <BookOpen className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center justify-between group hover:border-emerald-200 transition-all">
            <div>
              <p className="text-sm font-medium text-slate-500">Administradores</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{school.users.length}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tabela de Staff */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" /> Gestores da Instituição
                </h2>
                <button className="text-sm text-blue-600 font-semibold hover:underline">Ver todos</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase">
                    <tr>
                      <th className="px-6 py-4">Nome</th>
                      <th className="px-6 py-4">Contacto</th>
                      <th className="px-6 py-4">Cargo</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {school.users.map((admin) => (
                      <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-700">{admin.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1.5 font-mono">
                            <Mail className="w-3.5 h-3.5" /> {admin.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-tighter">
                            {admin.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar de Informações do SaaS */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/10">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-blue-400">
                <Building2 className="w-5 h-5" /> Detalhes do Contrato
              </h3>
              
              <div className="space-y-5">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">ID de Registro</span>
                  <span className="font-mono text-sm bg-slate-800 p-2 rounded border border-slate-700">{school.id}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-y border-slate-800">
                  <span className="text-slate-400 text-sm">Plano Atual</span>
                  <span className="font-bold text-blue-400">Premium SaaS</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Pagamento</span>
                  <span className="text-xs font-bold text-emerald-400 px-2 py-1 bg-emerald-400/10 rounded border border-emerald-400/20">Em Dia</span>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 transition-colors py-3 rounded-xl text-sm font-semibold border border-slate-700">
                    Editar <ExternalLink className="w-3 h-3" />
                  </button>
                  <button className="bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors py-3 rounded-xl text-sm font-semibold border border-red-500/20">
                    Suspender
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <h4 className="font-bold text-slate-800 mb-2">Suporte Prioritário</h4>
              <p className="text-sm text-slate-500 mb-4 leading-relaxed">Esta escola está sob o plano de suporte premium com resposta em 2 horas.</p>
              <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all">
                Contactar Gestor da Conta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;