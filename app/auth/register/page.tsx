import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Começar Agora</h1>
        <p className="text-slate-500 text-sm">Crie o perfil da sua instituição em poucos minutos.</p>
      </div>
      
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="schoolName">Nome da Instituição</Label>
          <Input id="schoolName" placeholder="Ex: Instituto Superior de Tecnologia" className="h-12" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email de Administrador</Label>
          <Input id="email" type="email" placeholder="admin@escola.com" className="h-12" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Criar Palavra-passe</Label>
          <Input id="password" type="password" className="h-12" required />
        </div>
        
        <div className="text-[11px] text-slate-500 leading-relaxed">
          Ao clicar em continuar, você aceita os nossos <Link href="#" className="underline">Termos de Serviço</Link> e a nossa <Link href="#" className="underline">Política de Privacidade</Link>.
        </div>

        <Button className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700">
          Criar Conta
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Já tem uma conta?{" "}
        <Link href="/auth/login" className="font-bold text-blue-600 hover:underline">
          Fazer Login
        </Link>
      </p>
    </div>
  );
}