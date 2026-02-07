"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Para redirecionar
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
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

export default function NewCoursePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
//  const [type, setType] = useState("");
  const [durationMonths, setDurationMonths] = useState("12");
  const [registrationFee, setRegistrationFee] = useState("");
  const [priceRules, setPriceRules] = useState([{ subjectCount: 1, price: "" }]);

  const addPriceRule = () => {
    // Sugere automaticamente a próxima quantidade de disciplinas
    const nextCount = priceRules.length > 0 ? Math.max(...priceRules.map(r => r.subjectCount)) + 1 : 1;
    setPriceRules([...priceRules, { subjectCount: nextCount, price: "" }]);
  };

  const removePriceRule = (index: number) => {
    setPriceRules(priceRules.filter((_, i) => i !== index));
  };

  const updatePriceRule = (index: number, field: "subjectCount" | "price", value: string) => {
    const newRules = [...priceRules];
    (newRules[index] as any)[field] = value === "" ? "" : Number(value);
    setPriceRules(newRules);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Busca segura do token
    const storedUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
    const token = user?.access_token || storedUser.access_token;

    if (!name  || !registrationFee || priceRules.some(r => !r.price)) {
      toast.error("Por favor, preencha todos os campos e todas as regras de preço.");
      return;
    }

    setLoading(true);

    const payload = {
      name,
    //  type,
      durationMonths: Number(durationMonths),
      registrationFee: Number(registrationFee),
      priceRules: priceRules.map(r => ({
        subjectCount: Number(r.subjectCount),
        price: Number(r.price)
      }))
    };

    try {
      const response = await fetch("http://localhost:3001/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao salvar curso");
      }

      toast.success("Curso e regras de preço cadastrados com sucesso!");
      router.push("/dashboard/courses"); // Volta para a listagem
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Erro na conexão com o servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Configurar Novo Curso</CardTitle>
          <p className="text-sm text-muted-foreground">
            Defina o nome, a taxa de entrada e quanto custa a mensalidade baseada na quantidade de disciplinas.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do curso</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Enfermagem Geral" />
              </div>
              {/* <div className="space-y-2">
                <Label>Modalidade (Tipo)</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Intensivo">Intensivo</SelectItem>
                    <SelectItem value="Especial">Especial</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duração (Meses)</Label>
                <Input type="number" value={durationMonths} onChange={(e) => setDurationMonths(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Taxa de Inscrição (MT)</Label>
                <Input type="number" value={registrationFee} onChange={(e) => setRegistrationFee(e.target.value)} placeholder="0.00" />
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <Label className="text-lg font-semibold">Tabela de Mensalidades</Label>
                  <p className="text-xs text-muted-foreground">Defina valores diferentes para alunos que fazem mais matérias.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addPriceRule} className="border-primary text-primary hover:bg-primary/10">
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Faixa
                </Button>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {priceRules.map((rule, index) => (
                  <div key={index} className="flex items-end gap-4 bg-muted/20 p-4 rounded-xl border border-dashed">
                    <div className="w-32">
                      <Label className="text-xs font-bold">Nº Disciplinas</Label>
                      <Input 
                        type="number" 
                        value={rule.subjectCount} 
                        onChange={(e) => updatePriceRule(index, "subjectCount", e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs font-bold">Preço da Mensalidade (MT)</Label>
                      <Input 
                        type="number" 
                        value={rule.price} 
                        onChange={(e) => updatePriceRule(index, "price", e.target.value)}
                        placeholder="Ex: 2500"
                        className="bg-background"
                      />
                    </div>
                    {index > 0 && (
                      <Button variant="ghost" size="icon" onClick={() => removePriceRule(index)} className="hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
              <Button type="submit" disabled={loading} className="px-8">
                {loading ? "Processando..." : "Salvar Curso e Regras"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}