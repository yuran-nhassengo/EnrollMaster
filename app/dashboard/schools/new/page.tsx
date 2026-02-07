"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import { ShieldCheck, Copy, ArrowLeft } from "lucide-react";

export default function NewRegistrationPage() {
  const [schoolName, setSchoolName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Estado para o Modal de Sucesso com credenciais
  const [showSuccess, setShowSuccess] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const { user } = useAuth();
  const router = useRouter();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!schoolName || !phone || !location) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    const payload = {
      name: schoolName,
      location: location,
      contact: phone,
    };

    try {
      const response = await fetch("http://localhost:3001/schools", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.access_token}` 
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Armazena as credenciais geradas pelo NestJS para mostrar no Modal
        setCredentials(data.credentials);
        setShowSuccess(true);
        
        // Limpa o form
        setSchoolName("");
        setPhone("");
        setLocation("");
      } else {
        toast.error(data.message || "Erro ao registrar escola");
      }
    } catch (error) {
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar à lista
      </Button>

      <Card className="shadow-lg border-primary/10">
        <CardHeader className="bg-primary/5">
          <CardTitle>Registrar Nova Instituição</CardTitle>
          <p className="text-sm text-muted-foreground">O sistema criará automaticamente um administrador para esta escola.</p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Escola / Instituição</Label>
              <Input
                id="name"
                placeholder="Ex: Instituto Politécnico de Maputo"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone de Contacto</Label>
                <Input
                  id="phone"
                  placeholder="Ex: +258 84 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loc">Localização (Cidade/Bairro)</Label>
                <Input
                  id="loc"
                  placeholder="Ex: Matola, Fomento"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="submit" disabled={loading} className="w-full md:w-auto px-10">
                {loading ? "Criando Escola..." : "Finalizar Cadastro"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* MODAL DE SUCESSO E CREDENCIAIS */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
              <ShieldCheck className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-center text-xl">Escola Registrada!</DialogTitle>
            <DialogDescription className="text-center">
              As credenciais de acesso padrão foram geradas automaticamente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-muted p-4 rounded-lg space-y-3 my-4 border">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">E-mail de Acesso</Label>
              <div className="flex items-center justify-between bg-background p-2 rounded border">
                <code className="text-sm">{credentials.email}</code>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(credentials.email)}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Senha Padrão</Label>
              <div className="flex items-center justify-between bg-background p-2 rounded border">
                <code className="text-sm font-bold text-primary">{credentials.password}</code>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(credentials.password)}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button className="w-full" onClick={() => {
              setShowSuccess(false);
              router.push("/dashboard/schools");
            }}>
              Entendido e Copiado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}