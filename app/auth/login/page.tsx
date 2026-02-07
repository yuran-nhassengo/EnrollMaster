"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/app/context/AuthContext";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error("Credenciais inválidas.");
      const data = await response.json();
      login(data.access_token);
      toast.success("Bem-vindo de volta!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao conectar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-3">
        <h1 className="text-5xl font-black tracking-tight text-slate-950">
          Aceder
        </h1>
        <p className="text-slate-500 text-lg font-medium">
          Gestão centralizada para a sua instituição.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          {/* Email - Altura h-14 e Fonte Maior */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-900 font-bold text-base ml-1">
              Email Institucional
            </Label>
            <div className="relative group">
              <Mail className="absolute left-4 top-4.5 h-6 w-6 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <Input
                id="email"
                placeholder="admin@escola.co.mz"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-14 text-lg border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all bg-slate-50/50 focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Senha - Altura h-14 e Fonte Maior */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <Label htmlFor="password" className="text-slate-900 font-bold text-base">
                Palavra-passe
              </Label>
              <Link href="#" className="text-sm font-bold text-blue-600 hover:underline">
                Esqueceu-se?
              </Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-4.5 h-6 w-6 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 h-14 text-lg border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all bg-slate-50/50 focus:bg-white"
                required
              />
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xl rounded-2xl transition-all shadow-xl shadow-blue-100 active:scale-[0.97]"
        >
          {loading ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : (
            <span className="flex items-center gap-3">
              Entrar no Painel <ArrowRight className="h-6 w-6" />
            </span>
          )}
        </Button>
      </form>

      <div className="pt-8 text-center">
        <p className="text-slate-600 text-base">
          Ainda não é parceiro?{" "}
          <Link href="/auth/register" className="font-black text-blue-600 hover:text-blue-800 transition-colors ml-1">
            Registar Instituição
          </Link>
        </p>
      </div>
    </div>
  );
}